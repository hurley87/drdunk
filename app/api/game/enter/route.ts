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
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
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

    // Check if Supabase admin is configured
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

    console.log(`[game/enter] Processing entry for FID ${fid}, round ${roundId}`);

    // Check if user already entered today
    const { data: existingEntry, error: existingEntryError } = await supabaseAdmin
      .from("game_entries")
      .select("id")
      .eq("round_id", roundId)
      .eq("fid", fid)
      .single();

    if (existingEntryError && existingEntryError.code !== "PGRST116") {
      throw existingEntryError;
    }

    if (existingEntry) {
      return NextResponse.json(
        {
          error: "Already entered",
          message: "You have already entered this round",
        },
        { status: 400 }
      );
    }

    // Verify the on-chain transaction and extract temp cast hash
    let walletAddress = "";
    let tempCastHash = "";
    let potContribution = 0.9;
    
    try {
      const chain = env.NEXT_PUBLIC_APP_ENV === "production" ? base : baseSepolia;
      const client = createPublicClient({
        chain,
        transport: http(),
      });

      // Wait for transaction receipt to verify it succeeded
      const receipt = await client.waitForTransactionReceipt({
        hash: paymentTxHash as `0x${string}`,
      });

      if (receipt.status !== "success") {
        return NextResponse.json(
          {
            error: "Transaction failed",
            message: "The payment transaction failed on-chain",
          },
          { status: 400 }
        );
      }

      // Get transaction details
      const tx = await client.getTransaction({
        hash: paymentTxHash as `0x${string}`,
      });

      if (tx.from) {
        walletAddress = tx.from;
      } else {
        return NextResponse.json(
          {
            error: "Invalid transaction",
            message: "Could not extract wallet address from transaction",
          },
          { status: 400 }
        );
      }

      // Verify transaction was sent to the correct contract
      const contractAddress = env.GAME_CONTRACT_ADDRESS;
      if (!contractAddress || tx.to?.toLowerCase() !== contractAddress.toLowerCase()) {
        return NextResponse.json(
          {
            error: "Invalid transaction",
            message: "Transaction was not sent to the game contract",
          },
          { status: 400 }
        );
      }

      // Decode the transaction input to extract the temp cast hash
      if (tx.input) {
        try {
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
            tempCastHash = decoded.args[0] as string;
            console.log(`[game/enter] Extracted temp cast hash from tx: ${tempCastHash}`);
          }

          // Read entryFee from contract
          try {
            const entryFee = await client.readContract({
              address: contractAddress as `0x${string}`,
              abi: DOCTOR_DUNK_ABI,
              functionName: "entryFee",
            });
            const entryFeeNumber = Number(entryFee);
            potContribution = (entryFeeNumber * 90) / 100 / 1e6;
          } catch {
            console.warn("[game/enter] Failed to read entryFee from contract, using default 0.9");
          }
        } catch (decodeError) {
          console.warn("[game/enter] Failed to decode transaction input:", decodeError);
        }
      }
    } catch (error) {
      console.error("[game/enter] Failed to verify transaction:", error);
      return NextResponse.json(
        {
          error: "Transaction verification failed",
          message: error instanceof Error ? error.message : "Failed to verify transaction on-chain",
        },
        { status: 400 }
      );
    }

    // Generate fallback temp hash if not extracted
    if (!tempCastHash) {
      tempCastHash = `temp-${Date.now()}-${fid}`;
      console.log(`[game/enter] Generated fallback temp hash: ${tempCastHash}`);
    }

    // Get or create current round
    let { data: round, error: roundError } = await supabaseAdmin
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError && roundError.code !== "PGRST116") {
      throw roundError;
    }

    if (!round) {
      const roundDate = new Date(roundId * 86400000).toISOString().split("T")[0];
      const { error: createRoundError } = await supabaseAdmin
        .from("game_rounds")
        .insert({
          id: roundId,
          date: roundDate,
          pot_amount: 0,
          status: "active",
        });

      if (createRoundError) {
        throw createRoundError;
      }

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

    // Update pot amount atomically
    const { error: potUpdateError } = await supabaseAdmin.rpc("increment_pot_amount", {
      round_id: roundId,
      amount: potContribution,
    });

    if (potUpdateError) {
      console.error("[game/enter] Failed to increment pot:", potUpdateError);
      return NextResponse.json(
        {
          error: "Failed to update pot amount",
          message: "Database function increment_pot_amount not found.",
        },
        { status: 500 }
      );
    }

    const { data: entry, error: entryError } = await supabaseAdmin
      .from("game_entries")
      .insert({
        round_id: roundId,
        fid,
        wallet_address: walletAddress,
        cast_hash: tempCastHash,
        contract_cast_hash: tempCastHash,
        cast_url: "",
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
      await supabaseAdmin.rpc("increment_pot_amount", {
        round_id: roundId,
        amount: -potContribution,
      });
      return NextResponse.json(
        {
          error: "Failed to create entry",
          message: entryError.message,
        },
        { status: 500 }
      );
    }

    // NOW post cast to Farcaster (payment is confirmed, entry exists)
    let castHash: string;
    let castUrl: string;

    try {
      const castResponse = await postDunkCast(dunkText, parentCastUrl);
      castHash = castResponse.cast?.hash || castResponse.result?.cast?.hash || "";
      const authorFid = castResponse.cast?.author?.fid || castResponse.result?.cast?.author?.fid;
      castUrl = castHash && authorFid 
        ? `https://warpcast.com/${authorFid}/${castHash}`
        : "";
    } catch (error) {
      console.error(
        `[game/enter] CAST_POST_FAILED: Payment confirmed but cast posting failed. ` +
        `FID=${fid}, roundId=${roundId}, entryId=${entry.id}, tempHash="${tempCastHash}". ` +
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      // Entry exists with temp hash - user paid, just couldn't post cast
      // Don't rollback - they need to contact support
      return NextResponse.json(
        {
          error: "Failed to post cast",
          message: "Payment confirmed but cast posting failed. Please contact support.",
          data: { entryId: entry.id, tempCastHash },
        },
        { status: 500 }
      );
    }

    if (!castHash) {
      return NextResponse.json(
        {
          error: "Invalid cast response",
          message: "Payment confirmed but failed to get cast hash. Please contact support.",
          data: { entryId: entry.id, tempCastHash },
        },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("game_entries")
      .update({ cast_hash: castHash, cast_url: castUrl })
      .eq("id", entry.id);

    if (updateError) {
      console.error(`[game/enter] Failed to update entry with real cast hash: ${updateError.message}`);
    }

    // Update contract's cast hash mapping
    const contractAddress = env.GAME_CONTRACT_ADDRESS;
    const privateKey = env.CRON_WALLET_PRIVATE_KEY;
    let contractUpdateSuccess = false;

    if (contractAddress && privateKey && tempCastHash !== castHash) {
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

      console.log(`[game/enter] Updating contract cast hash: ${tempCastHash} -> ${castHash}`);

      // Retry up to 3 times
      for (let attempt = 1; attempt <= 3 && !contractUpdateSuccess; attempt++) {
        try {
          const hash = await walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            abi: UPDATE_CAST_HASH_ABI,
            functionName: "updateCastHash",
            args: [tempCastHash, castHash],
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          if (receipt.status === "success") {
            console.log(`[game/enter] Contract updated successfully (attempt ${attempt})`);
            contractUpdateSuccess = true;
            
            // Update database to reflect contract state
            await supabaseAdmin
              .from("game_entries")
              .update({ contract_cast_hash: castHash })
              .eq("id", entry.id);
          }
        } catch (error) {
          console.error(`[game/enter] Contract update failed (attempt ${attempt}):`, error);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (!contractUpdateSuccess) {
        console.error(
          `[game/enter] SYNC_FAILED: Contract hash sync failed after 3 attempts. ` +
          `FID=${fid}, roundId=${roundId}, entryId=${entry.id}, ` +
          `tempHash="${tempCastHash}", realHash="${castHash}". ` +
          `Daily winner cron will attempt to sync using stored mapping.`
        );
      }
    }

    console.log(`[game/enter] Entry created successfully for FID ${fid}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          entry: { ...entry, cast_hash: castHash, cast_url: castUrl },
          castHash,
          castUrl,
          contractSynced: contractUpdateSuccess,
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
