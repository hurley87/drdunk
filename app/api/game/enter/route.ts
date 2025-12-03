import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateQuickAuth } from "@/lib/quick-auth";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase"; 
import { getCurrentRoundId } from "@/lib/game-utils";
import { postDunkCast } from "@/lib/webhook/neynar";
import { env } from "@/lib/env";
import { createPublicClient, createWalletClient, http, decodeFunctionData } from "viem";
import { base, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Validation for cast URL or hash
const castUrlOrHashSchema = z.string().min(1, "Cast URL or hash is required").refine(
  (val) => {
    const trimmed = val.trim();
    // Accept URLs (must start with http:// or https://)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
    // Accept cast hashes (must start with 0x and be hex)
    if (trimmed.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(trimmed)) {
      return true;
    }
    return false;
  },
  {
    message: "Must be a valid cast URL (https://warpcast.com/...) or cast hash (0x...)",
  }
);

const enterGameSchema = z.object({
  dunkText: z.string().min(1, "Dunk text cannot be empty"),
  parentCastUrl: castUrlOrHashSchema,
  paymentTxHash: z.string().min(1, "Payment transaction hash required"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await validateQuickAuth(request);

    if (!authResult) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "You must be signed in to enter the game",
        },
        { status: 401 }
      );
    }

    const fid = authResult.fid;
    const body = await request.json();

    // Validate input
    const validationResult = enterGameSchema.safeParse(body);

    console.log("validationResult", validationResult);

    if (!validationResult.success) {

      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { dunkText, parentCastUrl, paymentTxHash } = validationResult.data;

    // Check if Supabase admin is configured (requires service role key for write operations)
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message: "Database is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    // Get current round ID
    const roundId = getCurrentRoundId();

    console.log("roundId", roundId);

    // Check if user already entered today
    const { data: existingEntry, error: existingEntryError } = await supabaseAdmin
      .from("game_entries")
      .select("id")
      .eq("round_id", roundId)
      .eq("fid", fid)
      .single();

    console.log("existingEntry", existingEntry);
    console.log("existingEntryError", existingEntryError);

    // PGRST116 is "not found" error - this is expected if user hasn't entered yet
    if (existingEntryError && existingEntryError.code !== "PGRST116") {
      throw existingEntryError;
    }

    if (existingEntry) {
      console.log("existingEntry", existingEntry);
      return NextResponse.json(
        {
          error: "Already entered",
          message: "You have already entered this round",
        },
        { status: 400 }
      );
    }

    console.log("paymentTxHash", paymentTxHash);

    // Extract wallet address and temporary cast hash from payment transaction
    // IMPORTANT: Verify transaction succeeded on-chain before accepting entry
    let walletAddress = "";
    let tempCastHash = "";
    let potContribution = 0.9; // Default, will be updated from contract if available
    
    try {
      const chain = env.NEXT_PUBLIC_APP_ENV === "production" ? base : baseSepolia;
      const client = createPublicClient({
        chain,
        transport: http(),
      });

      // Wait for transaction receipt to verify it succeeded on-chain
      // This prevents accepting pending, failed, or unconfirmed transactions
      const receipt = await client.waitForTransactionReceipt({
        hash: paymentTxHash as `0x${string}`,
      });

      console.log("receipt", receipt);

      if (receipt.status !== "success") {
        return NextResponse.json(
          {
            error: "Transaction failed",
            message: "The payment transaction failed on-chain",
          },
          { status: 400 }
        );
      }

      // Get transaction details to extract the sender's wallet address and cast hash
      const tx = await client.getTransaction({
        hash: paymentTxHash as `0x${string}`,
      });

      console.log("tx", tx);

      if (tx.from) {
        walletAddress = tx.from;
        console.log("walletAddress", walletAddress);
      } else {
        console.warn("[game/enter] Could not extract wallet address from transaction");
      }

      // Verify transaction was sent to the correct contract
      // Use server-side env variable (not NEXT_PUBLIC prefix which is for client-side)
      const contractAddress = env.GAME_CONTRACT_ADDRESS;
      console.log("contractAddress", contractAddress);
      console.log("tx.to", tx.to);
      if (!contractAddress || tx.to?.toLowerCase() !== contractAddress.toLowerCase()) {
        console.log("Invalid transaction");
        return NextResponse.json(
          {
            error: "Invalid transaction",
            message: "Transaction was not sent to the game contract",
          },
          { status: 400 }
        );
      }

      // Decode the transaction input to extract the temporary cast hash
      // The contract function is enterGame(string memory castHash)
      if (tx.input) {
        try {
          console.log("tx.input", tx.input);
          const DOCTOR_DUNK_ABI = [
            {
              inputs: [{ name: "castHash", type: "string" }],
              name: "enterGame",
              outputs: [],
              type: "function",
              stateMutability: "nonpayable",
            },
            {
              inputs: [],
              name: "entryFee",
              outputs: [{ name: "", type: "uint256" }],
              type: "function",
              stateMutability: "view",
            },
          ] as const;
          
          const decoded = decodeFunctionData({
            abi: DOCTOR_DUNK_ABI,
            data: tx.input,
          });
          
          if (decoded.functionName === "enterGame" && decoded.args && decoded.args[0]) {
            console.log("decoded", decoded);
            tempCastHash = decoded.args[0] as string;
            console.log("tempCastHash", tempCastHash);
          }

          // Read entryFee from contract to calculate actual pot contribution
          try {
            const entryFee = await client.readContract({
              address: contractAddress as `0x${string}`,
              abi: DOCTOR_DUNK_ABI,
              functionName: "entryFee",
            });

            console.log("entryFee", entryFee);

            // Calculate pot contribution: entryFee * 90 / 100 (90% goes to pot, 10% is fee)
            // entryFee is in smallest unit (e.g., 1e6 for 1 USDC with 6 decimals)
            const entryFeeNumber = Number(entryFee);
            potContribution = (entryFeeNumber * 90) / 100 / 1e6; // Convert from smallest unit to USDC
            console.log("potContribution", potContribution);
          } catch (feeError) {
            console.log("feeError", feeError);
            console.warn("[game/enter] Failed to read entryFee from contract, using default 0.9:", feeError);
            // Continue with default 0.9 if contract read fails
          }
        } catch (decodeError) {
          console.log("decodeError", decodeError);
          console.warn("[game/enter] Failed to decode transaction input:", decodeError);
        }
      }
    } catch (error) {
      console.log("error", error);
      console.error("[game/enter] Failed to verify transaction:", error);
      return NextResponse.json(
        {
          error: "Transaction verification failed",
          message: error instanceof Error ? error.message : "Failed to verify transaction on-chain",
        },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      console.log("!walletAddress", !walletAddress);
      return NextResponse.json(
        {
          error: "Invalid payment transaction",
          message: "Could not extract wallet address from payment transaction",
        },
        { status: 400 }
      );
    }

    console.log("roundId", roundId);

    // Get or create current round
    let { data: round, error: roundError } = await supabaseAdmin
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError && roundError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      throw roundError;
    }

    if (!round) {
      // Create new round
      const roundDate = new Date(roundId * 86400000).toISOString().split("T")[0];
      const { error: createRoundError } = await supabaseAdmin
        .from("game_rounds")
        .insert({
          id: roundId,
          date: roundDate,
          pot_amount: 0, // Initialize to 0, will be incremented when entry is created
          status: "active",
        });

      if (createRoundError) {
        throw createRoundError;
      }

      // Fetch the newly created round to get accurate pot_amount
      const { data: newRound, error: fetchError } = await supabaseAdmin
        .from("game_rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      round = newRound;
    }

    // IMPORTANT: Do database operations BEFORE posting cast to Farcaster
    // This prevents orphaned casts if database operations fail
    // Use tempCastHash for initial entry creation, then update with real castHash after posting
    
    // Update round pot amount atomically FIRST
    // Pot contribution is calculated dynamically from contract's entryFee (90% goes to pot, 10% is fee)
    // This ensures database stays in sync even if entryFee is changed via setEntryFee()
    // Use atomic increment via RPC function to prevent race conditions with concurrent requests
    // IMPORTANT: Update pot BEFORE creating entry to maintain atomicity - if entry creation fails,
    // we can rollback the pot increment. If we create entry first and pot update fails, we have
    // an orphaned entry with no pot increment.
    const { error: potUpdateError } = await supabaseAdmin.rpc("increment_pot_amount", {
      round_id: roundId,
      amount: potContribution,
    });

    if (potUpdateError) {
      console.error("[game/enter] Failed to atomically increment pot:", potUpdateError);
      // If RPC function doesn't exist, this is a critical error
      // The database function should be created via supabaseAdmin-schema.sql
      return NextResponse.json(
        {
          error: "Failed to update pot amount",
          message: "Database function increment_pot_amount not found. Please run the database migrations.",
        },
        { status: 500 }
      );
    }

    // Create entry with tempCastHash FIRST (before posting cast)
    // This ensures database operations succeed before we post to Farcaster
    // We'll update the cast_hash after posting the cast successfully
    const initialCastHash = tempCastHash || `temp-${Date.now()}-${fid}`;
    let { data: entry, error: entryError } = await supabaseAdmin
      .from("game_entries")
      .insert({
        round_id: roundId,
        fid,
        wallet_address: walletAddress,
        cast_hash: initialCastHash,
        cast_url: "", // Will be updated after cast is posted
        dunk_text: dunkText,
        payment_tx_hash: paymentTxHash,
        engagement_score: 0,
        likes: 0,
        recasts: 0,
        replies: 0,
      })
      .select()
      .single();

    if (entryError) {
      console.error("[game/enter] Database error:", entryError);
      
      // Rollback pot increment since entry creation failed
      // This maintains atomicity: either both succeed or both fail
      try {
        await supabaseAdmin.rpc("increment_pot_amount", {
          round_id: roundId,
          amount: -potContribution, // Decrement by the same amount
        });
        console.log(`[game/enter] Rolled back pot increment for round ${roundId}`);
      } catch (rollbackError) {
        console.error("[game/enter] Failed to rollback pot increment:", rollbackError);
        // Log error but don't fail the request - ops can fix manually if needed
      }
      
      return NextResponse.json(
        {
          error: "Failed to create entry",
          message: entryError.message,
        },
        { status: 500 }
      );
    }

    // NOW post cast to Farcaster (after database operations succeed)
    // This prevents orphaned casts if database operations fail
    let castHash: string;
    let castUrl: string;

    try {
      const castResponse = await postDunkCast(dunkText, parentCastUrl);
      // Handle both response formats
      castHash = castResponse.cast?.hash || castResponse.result?.cast?.hash || "";
      const authorFid = castResponse.cast?.author?.fid || castResponse.result?.cast?.author?.fid;
      castUrl = castHash && authorFid 
        ? `https://warpcast.com/${authorFid}/${castHash}`
        : "";
    } catch (error) {
      console.error("[game/enter] Failed to post cast:", error);
      // Rollback database operations since cast posting failed
      try {
        // Delete the entry
        await supabaseAdmin.from("game_entries").delete().eq("id", entry.id);
        // Rollback pot increment
        await supabaseAdmin.rpc("increment_pot_amount", {
          round_id: roundId,
          amount: -potContribution,
        });
        console.log(`[game/enter] Rolled back entry and pot increment due to cast posting failure`);
      } catch (rollbackError) {
        console.error("[game/enter] Failed to rollback after cast posting failure:", rollbackError);
      }
      
      return NextResponse.json(
        {
          error: "Failed to post cast",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    if (!castHash) {
      // Rollback database operations since cast posting failed
      try {
        await supabaseAdmin.from("game_entries").delete().eq("id", entry.id);
        await supabaseAdmin.rpc("increment_pot_amount", {
          round_id: roundId,
          amount: -potContribution,
        });
        console.log(`[game/enter] Rolled back entry and pot increment due to invalid cast response`);
      } catch (rollbackError) {
        console.error("[game/enter] Failed to rollback after invalid cast response:", rollbackError);
      }
      
      return NextResponse.json(
        {
          error: "Invalid cast response",
          message: "Failed to get cast hash from Neynar",
        },
        { status: 500 }
      );
    }

    // Check if cast hash already exists in this round (shouldn't happen, but check anyway)
    const { data: existingCast, error: existingCastError } = await supabaseAdmin
      .from("game_entries")
      .select("id")
      .eq("round_id", roundId)
      .eq("cast_hash", castHash)
      .single();

    // PGRST116 is "not found" error - this is expected if cast hash is new
    if (existingCastError && existingCastError.code !== "PGRST116") {
      throw existingCastError;
    }

    if (existingCast && existingCast.id !== entry.id) {
      // Rollback database operations since cast hash already exists
      try {
        await supabaseAdmin.from("game_entries").delete().eq("id", entry.id);
        await supabaseAdmin.rpc("increment_pot_amount", {
          round_id: roundId,
          amount: -potContribution,
        });
        console.log(`[game/enter] Rolled back entry and pot increment - cast hash already exists`);
      } catch (rollbackError) {
        console.error("[game/enter] Failed to rollback after duplicate cast hash:", rollbackError);
      }
      
      return NextResponse.json(
        {
          error: "Cast hash already used",
          message: "This cast has already been submitted",
        },
        { status: 400 }
      );
    }

    // Update entry with real cast hash and cast URL
    // Retry up to 3 times to handle transient database errors
    let updateError = null;
    let retries = 3;
    let updateSucceeded = false;
    
    while (retries > 0 && !updateSucceeded) {
      const { error, data } = await supabaseAdmin
        .from("game_entries")
        .update({
          cast_hash: castHash,
          cast_url: castUrl,
        })
        .eq("id", entry.id)
        .select()
        .single();
      
      if (error) {
        updateError = error;
        retries--;
        if (retries > 0) {
          // Wait 500ms before retry (exponential backoff could be used here)
          await new Promise(resolve => setTimeout(resolve, 500));
          console.warn(`[game/enter] Retrying cast hash update (${retries} retries remaining)...`);
        }
      } else {
        updateSucceeded = true;
        // Update entry object with fresh data
        if (data) {
          entry = data;
        }
      }
    }

    if (!updateSucceeded && updateError) {
      console.error("[game/enter] Failed to update entry with real cast hash after retries:", updateError);
      
      // Try to fetch the current entry state to verify
      const { data: currentEntry, error: fetchError } = await supabaseAdmin
        .from("game_entries")
        .select("*")
        .eq("id", entry.id)
        .single();
      
      if (!fetchError && currentEntry) {
        // If entry was actually updated (race condition or eventual consistency), use it
        if (currentEntry.cast_hash === castHash) {
          entry = currentEntry;
          updateSucceeded = true;
        } else {
          // Entry still has temp hash - return error response
          return NextResponse.json(
            {
              error: "Database update failed",
              message: "Cast was posted successfully, but failed to update database entry. Please contact support.",
              data: {
                castHash,
                castUrl,
                entryId: entry.id,
                // Include cast info so user knows it was posted
                castPosted: true,
              },
            },
            { status: 500 }
          );
        }
      } else {
        // Couldn't verify entry state - return error
        return NextResponse.json(
          {
            error: "Database update failed",
            message: "Cast was posted successfully, but failed to update database entry. Please contact support.",
            data: {
              castHash,
              castUrl,
              entryId: entry.id,
              castPosted: true,
            },
          },
          { status: 500 }
        );
      }
    }

    // Update contract's cast hash mapping from temporary hash to real hash
    // If tempCastHash was extracted and differs from the real castHash, update the contract
    if (tempCastHash && tempCastHash !== castHash && tempCastHash.startsWith("temp-")) {
      const contractAddress = env.GAME_CONTRACT_ADDRESS;
      const privateKey = env.CRON_WALLET_PRIVATE_KEY;

      if (contractAddress && privateKey) {
        try {
          const chain = env.NEXT_PUBLIC_APP_ENV === "production" ? base : baseSepolia;
          const publicClient = createPublicClient({
            chain,
            transport: http(),
          });

          const account = privateKeyToAccount(privateKey as `0x${string}`);
          const walletClient = createWalletClient({
            account,
            chain,
            transport: http(),
          });

          const UPDATE_CAST_HASH_ABI = [
            {
              inputs: [
                { name: "oldCastHash", type: "string" },
                { name: "newCastHash", type: "string" },
              ],
              name: "updateCastHash",
              outputs: [],
              type: "function",
              stateMutability: "nonpayable",
            },
          ] as const;

          console.log(`[game/enter] Updating cast hash on contract: ${tempCastHash} -> ${castHash}`);

          const hash = await walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            abi: UPDATE_CAST_HASH_ABI,
            functionName: "updateCastHash",
            args: [tempCastHash, castHash],
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          if (receipt.status === "success") {
            console.log(`[game/enter] Successfully updated cast hash on contract`);
          } else {
            console.error(`[game/enter] Failed to update cast hash on contract: transaction failed`);
          }
        } catch (error) {
          console.error(`[game/enter] Failed to update cast hash on contract:`, error);
          // Don't fail the request - database entry is created, contract update is best-effort
          // But log a warning since this creates inconsistency
          console.warn(
            `[game/enter] Cast hash mismatch: contract has temp hash "${tempCastHash}", ` +
            `database has real hash "${castHash}". Contract mapping should be updated manually.`
          );
        }
      } else {
        console.warn(
          `[game/enter] Cast hash mismatch: contract has temp hash "${tempCastHash}", ` +
          `database has real hash "${castHash}". Contract mapping cannot be updated - ` +
          `GAME_CONTRACT_ADDRESS or CRON_WALLET_PRIVATE_KEY not configured.`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          entry,
          castHash,
          castUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[game/enter] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

