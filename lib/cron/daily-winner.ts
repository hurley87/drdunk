import { supabase, supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { getCurrentRoundId } from "@/lib/game-utils";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { env } from "@/lib/env";

// DoctorDunk contract ABI (minimal)
const DOCTOR_DUNK_ABI = [
  {
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "castHashes", type: "string[]" },
      { name: "likes", type: "uint256[]" },
      { name: "recasts", type: "uint256[]" },
      { name: "replies", type: "uint256[]" },
    ],
    name: "finalizeRound",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "getRoundInfo",
    outputs: [
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "potAmount", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "winnerCastHash", type: "string" },
      { name: "finalized", type: "bool" },
      { name: "entryCount", type: "uint256" },
    ],
    type: "function",
    stateMutability: "view",
  },
] as const;

/**
 * Calculate and finalize the daily winner
 * This function should be called at the end of each UTC day
 */
export async function calculateDailyWinner() {
  try {
    console.log("[daily-winner] Starting daily winner calculation...");

    // Check if Supabase admin is configured (requires service role key for write operations)
    if (!isSupabaseAdminConfigured()) {
      const error = new Error("Database is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.");
      console.error("[daily-winner] Supabase not configured:", error.message);
      throw error;
    }

    // Get the previous round (yesterday)
    const currentRoundId = getCurrentRoundId();
    const previousRoundId = currentRoundId - 1;

    // Get round from database
    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", previousRoundId)
      .single();

    if (roundError && roundError.code !== "PGRST116") {
      throw roundError;
    }

    if (!round) {
      console.log(`[daily-winner] No round found for round ${previousRoundId}`);
      return {
        success: true,
        message: "No round to finalize",
      };
    }

    if (round.status === "finalized") {
      console.log(`[daily-winner] Round ${previousRoundId} already finalized`);
      return {
        success: true,
        message: "Round already finalized",
      };
    }

    // Get all entries for the round, ordered by engagement score (descending)
    // Secondary sort by created_at (ascending) to match contract tiebreaker logic:
    // earliest entry wins in case of identical engagement scores
    const { data: entries, error: entriesError } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", previousRoundId)
      .order("engagement_score", { ascending: false })
      .order("created_at", { ascending: true });

    if (entriesError) {
      throw entriesError;
    }

    if (!entries || entries.length === 0) {
      console.log(`[daily-winner] No entries for round ${previousRoundId}`);
      // Finalize round with no winner (use supabaseAdmin to bypass RLS)
      await supabaseAdmin
        .from("game_rounds")
        .update({
          status: "finalized",
          finalized_at: new Date().toISOString(),
        })
        .eq("id", previousRoundId);

      return {
        success: true,
        message: "Round finalized with no entries",
      };
    }

    // Find winner (highest engagement score)
    const winner = entries[0];
    const winnerFid = winner.fid;
    const winnerCastHash = winner.cast_hash;
    const winnerWalletAddress = winner.wallet_address;

    console.log(`[daily-winner] Winner: FID ${winnerFid}, Cast: ${winnerCastHash}`);

    // Update round with winner (use supabaseAdmin to bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from("game_rounds")
      .update({
        winner_fid: winnerFid,
        winner_cast_hash: winnerCastHash,
        winner_wallet_address: winnerWalletAddress,
        status: "finalized",
        finalized_at: new Date().toISOString(),
      })
      .eq("id", previousRoundId);

    if (updateError) {
      throw updateError;
    }

    // Call smart contract to finalize round
    // IMPORTANT: This must succeed for winners to be able to claim rewards
    const contractAddress = env.GAME_CONTRACT_ADDRESS;
    const privateKey = env.CRON_WALLET_PRIVATE_KEY;
    
    if (contractAddress && privateKey) {
      try {
        const chain = env.NEXT_PUBLIC_APP_ENV === "production" ? base : baseSepolia;
        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        // Create wallet client with private key
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        const walletClient = createWalletClient({
          account,
          chain,
          transport: http(),
        });

        console.log(`[daily-winner] Finalizing round ${previousRoundId} on contract ${contractAddress}...`);

        // Prepare engagement data arrays for contract call
        // Entries are already sorted by engagement_score descending, then created_at ascending
        const castHashes = entries.map((e) => e.cast_hash);
        const likes = entries.map((e) => BigInt(e.likes || 0));
        const recasts = entries.map((e) => BigInt(e.recasts || 0));
        const replies = entries.map((e) => BigInt(e.replies || 0));

        // Call finalizeRound on the contract with engagement data
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: DOCTOR_DUNK_ABI,
          functionName: "finalizeRound",
          args: [
            BigInt(previousRoundId),
            castHashes,
            likes,
            recasts,
            replies,
          ],
        });

        console.log(`[daily-winner] Transaction submitted: ${hash}`);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "success") {
          console.log(`[daily-winner] Round ${previousRoundId} finalized on contract successfully`);
        } else {
          throw new Error(`Transaction failed: ${hash}`);
        }
      } catch (error) {
        console.error("[daily-winner] Failed to finalize on contract:", error);
        // This is a critical error - database is updated but contract is not
        // Rollback database update to maintain consistency (use supabaseAdmin to bypass RLS)
        await supabaseAdmin
          .from("game_rounds")
          .update({
            status: "active", // Revert to active status
            finalized_at: null,
            winner_fid: null,
            winner_cast_hash: null,
            winner_wallet_address: null,
          })
          .eq("id", previousRoundId);

        throw new Error(
          `Failed to finalize round on contract. Database update rolled back. Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } else {
      if (!contractAddress) {
        console.warn("[daily-winner] GAME_CONTRACT_ADDRESS not set, skipping contract finalization");
      }
      if (!privateKey) {
        console.warn(
          "[daily-winner] CRON_WALLET_PRIVATE_KEY not set, skipping contract finalization. " +
            "Winners will not be able to claim rewards until the round is finalized on-chain."
        );
      }
    }

    // Send notification to winner (if notification system is set up)
    // TODO: Implement winner notification

    console.log(`[daily-winner] Round ${previousRoundId} finalized successfully`);

    return {
      success: true,
      roundId: previousRoundId,
      winner: {
        fid: winnerFid,
        castHash: winnerCastHash,
        walletAddress: winnerWalletAddress,
      },
      potAmount: round.pot_amount,
    };
  } catch (error) {
    console.error("[daily-winner] Error:", error);
    throw error;
  }
}

