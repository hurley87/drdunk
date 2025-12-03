import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { env } from "@/lib/env";
import { calculateWeightedScore } from "@/lib/game-utils";

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
    // Cache engagement data to avoid duplicate API calls
    const engagementCache = new Map<string, Awaited<ReturnType<typeof fetchCastEngagement>>>();

    // Fetch engagement for each entry and cache it
    for (const entry of entries) {
      // Check cache first, then fetch if not cached
      let engagement = engagementCache.get(entry.cast_hash);
      if (!engagement) {
        engagement = await fetchCastEngagement(entry.cast_hash);
        if (engagement) {
          engagementCache.set(entry.cast_hash, engagement);
        }
      }
      
      if (!engagement) {
        continue;
      }

      const weightedScore = calculateWeightedScore(
        engagement.likes,
        engagement.recasts,
        engagement.replies
      );

      // Update entry (use supabaseAdmin to bypass RLS)
      updates.push(
        supabaseAdmin
          .from("game_entries")
          .update({
            likes: engagement.likes,
            recasts: engagement.recasts,
            replies: engagement.replies,
            engagement_score: weightedScore.toString(),
          })
          .eq("id", entry.id)
      );

      // Create snapshot (use supabaseAdmin to bypass RLS)
      updates.push(
        supabaseAdmin
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

    // NOTE: Engagement is now stored off-chain only (in Supabase).
    // Engagement data will be provided to finalizeRound() when finalizing each round.
    // This saves gas costs by avoiding periodic on-chain updates during the round.

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

