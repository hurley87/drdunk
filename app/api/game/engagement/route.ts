import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";
import { calculateWeightedScore } from "@/lib/game-utils";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

// DoctorDunk contract ABI for recordEngagement
const DOCTOR_DUNK_ABI = [
  {
    inputs: [
      { name: "castHash", type: "string" },
      { name: "likes", type: "uint256" },
      { name: "recasts", type: "uint256" },
      { name: "replies", type: "uint256" },
    ],
    name: "recordEngagement",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
] as const;

/**
 * Fetch engagement metrics from Neynar API for a cast hash
 */
async function fetchCastEngagement(castHash: string) {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    const cast = data.result?.cast;

    if (!cast) {
      return null;
    }

    return {
      likes: cast.reactions?.likes?.length || 0,
      recasts: cast.reactions?.recasts?.length || 0,
      replies: cast.replies?.count || 0,
    };
  } catch (error) {
    console.error(`[engagement] Failed to fetch cast ${castHash}:`, error);
    return null;
  }
}

/**
 * Update engagement metrics for all active entries
 * This endpoint should be called periodically (via cron)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a Vercel Cron request or has valid Authorization header
    // Vercel Cron automatically sends the x-vercel-cron header
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const cronSecret = env.CRON_SECRET;

    // If CRON_SECRET is set, also verify it via Authorization header (for custom cron services)
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}` && !vercelCronHeader) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    } else if (!vercelCronHeader) {
      // If no CRON_SECRET is set, only allow Vercel Cron requests
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all active entries from current and recent rounds
    const currentRoundId = Math.floor(Date.now() / 86400000);
    const recentRounds = [currentRoundId, currentRoundId - 1]; // Current and previous day

    const { data: entries, error } = await supabase
      .from("game_entries")
      .select("*")
      .in("round_id", recentRounds)
      .not("cast_hash", "is", null);

    if (error) {
      throw error;
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No entries to update",
        updated: 0,
      });
    }

    let updated = 0;
    const updates = [];

    // Fetch engagement for each entry
    for (const entry of entries) {
      const engagement = await fetchCastEngagement(entry.cast_hash);
      
      if (!engagement) {
        continue;
      }

      const weightedScore = calculateWeightedScore(
        engagement.likes,
        engagement.recasts,
        engagement.replies
      );

      // Update entry
      updates.push(
        supabase
          .from("game_entries")
          .update({
            likes: engagement.likes,
            recasts: engagement.recasts,
            replies: engagement.replies,
            engagement_score: weightedScore.toString(),
          })
          .eq("id", entry.id)
      );

      // Create snapshot
      updates.push(
        supabase
          .from("engagement_snapshots")
          .insert({
            entry_id: entry.id,
            likes: engagement.likes,
            recasts: engagement.recasts,
            replies: engagement.replies,
            weighted_score: weightedScore.toString(),
          })
      );

      updated++;
    }

    // Execute all database updates
    await Promise.all(updates);

    // Sync engagement metrics to smart contract
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

        console.log(`[game/engagement] Syncing engagement to contract ${contractAddress}...`);

        // Sync each entry's engagement to the contract
        for (const entry of entries) {
          const engagement = await fetchCastEngagement(entry.cast_hash);
          if (!engagement) continue;

          try {
            const hash = await walletClient.writeContract({
              address: contractAddress as `0x${string}`,
              abi: DOCTOR_DUNK_ABI,
              functionName: "recordEngagement",
              args: [
                entry.cast_hash,
                BigInt(engagement.likes),
                BigInt(engagement.recasts),
                BigInt(engagement.replies),
              ],
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            if (receipt.status === "success") {
              console.log(`[game/engagement] Synced engagement for cast ${entry.cast_hash}`);
            } else {
              console.error(`[game/engagement] Failed to sync engagement for cast ${entry.cast_hash}: transaction failed`);
            }
          } catch (error) {
            console.error(`[game/engagement] Failed to sync engagement for cast ${entry.cast_hash}:`, error);
            // Continue with other entries even if one fails
          }
        }
      } catch (error) {
        console.error("[game/engagement] Failed to sync engagement to contract:", error);
        // Don't throw - database updates succeeded, contract sync is best-effort
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} entries`,
      updated,
    });
  } catch (error) {
    console.error("[game/engagement] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

