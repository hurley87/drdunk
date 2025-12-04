import { supabase, supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { getCurrentRoundId } from "@/lib/game-utils";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { env } from "@/lib/env";
import { GAME_CONTRACT_ADDRESS } from "@/lib/constants";

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
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "getRoundCastHashes",
    outputs: [{ name: "", type: "string[]" }],
    type: "function",
    stateMutability: "view",
  },
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
    const privateKey = env.CRON_WALLET_PRIVATE_KEY;
    
    if (privateKey) {
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

        console.log(`[daily-winner] Finalizing round ${previousRoundId} on contract ${GAME_CONTRACT_ADDRESS}...`);

        // Query the contract to get registered cast hashes
        const contractCastHashes = await publicClient.readContract({
          address: GAME_CONTRACT_ADDRESS as `0x${string}`,
          abi: DOCTOR_DUNK_ABI,
          functionName: "getRoundCastHashes",
          args: [BigInt(previousRoundId)],
        });

        console.log(`[daily-winner] Contract has ${contractCastHashes.length} registered cast hashes`);

        // Create maps for looking up entries:
        // 1. By contract_cast_hash (exact match for what's in contract)
        // 2. By cast_hash (fallback for already-synced entries)
        const dbEntriesByContractHash = new Map(
          entries.filter((e) => e.contract_cast_hash).map((e) => [e.contract_cast_hash, e])
        );
        const dbEntriesByCastHash = new Map(entries.map((e) => [e.cast_hash, e]));
        
        // Try to update any temp hashes in the contract to real hashes
        for (const contractHash of contractCastHashes) {
          if (contractHash.startsWith("temp-")) {
            // Find entry by contract_cast_hash (exact mapping)
            const entry = dbEntriesByContractHash.get(contractHash);
            
            if (entry && entry.cast_hash !== contractHash) {
              // We have the exact mapping! Update the contract
              try {
                console.log(`[daily-winner] Updating contract hash: ${contractHash} -> ${entry.cast_hash}`);
                const updateHash = await walletClient.writeContract({
                  address: GAME_CONTRACT_ADDRESS as `0x${string}`,
                  abi: DOCTOR_DUNK_ABI,
                  functionName: "updateCastHash",
                  args: [contractHash, entry.cast_hash],
                });
                const receipt = await publicClient.waitForTransactionReceipt({ hash: updateHash });
                if (receipt.status === "success") {
                  console.log(`[daily-winner] Successfully updated contract hash for FID ${entry.fid}`);
                }
              } catch (updateError) {
                console.error(`[daily-winner] Failed to update contract hash:`, updateError);
              }
            }
          }
        }
        
        // Re-fetch contract hashes after updates
        const finalContractCastHashes = await publicClient.readContract({
          address: GAME_CONTRACT_ADDRESS as `0x${string}`,
          abi: DOCTOR_DUNK_ABI,
          functionName: "getRoundCastHashes",
          args: [BigInt(previousRoundId)],
        });
        
        // Build engagement data arrays using contract's cast hashes
        const castHashesForContract: string[] = [];
        const likesForContract: bigint[] = [];
        const recastsForContract: bigint[] = [];
        const repliesForContract: bigint[] = [];
        
        for (const contractHash of finalContractCastHashes) {
          // Try to find entry by:
          // 1. contract_cast_hash (handles temp hash mapping)
          // 2. cast_hash (handles already-synced or direct match)
          let entry = dbEntriesByContractHash.get(contractHash) || dbEntriesByCastHash.get(contractHash);
          
          if (entry) {
            castHashesForContract.push(contractHash);
            likesForContract.push(BigInt(entry.likes || 0));
            recastsForContract.push(BigInt(entry.recasts || 0));
            repliesForContract.push(BigInt(entry.replies || 0));
          } else {
            console.warn(`[daily-winner] No database entry for contract hash: ${contractHash}, using zero engagement`);
            castHashesForContract.push(contractHash);
            likesForContract.push(BigInt(0));
            recastsForContract.push(BigInt(0));
            repliesForContract.push(BigInt(0));
          }
        }

        console.log(`[daily-winner] Finalizing with ${castHashesForContract.length} cast hashes`);

        // Call finalizeRound on the contract with engagement data
        const hash = await walletClient.writeContract({
          address: GAME_CONTRACT_ADDRESS as `0x${string}`,
          abi: DOCTOR_DUNK_ABI,
          functionName: "finalizeRound",
          args: [
            BigInt(previousRoundId),
            castHashesForContract,
            likesForContract,
            recastsForContract,
            repliesForContract,
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
      console.warn(
        "[daily-winner] CRON_WALLET_PRIVATE_KEY not set, skipping contract finalization. " +
          "Winners will not be able to claim rewards until the round is finalized on-chain."
      );
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

