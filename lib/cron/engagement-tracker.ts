import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { env } from "@/lib/env";
import { calculateWeightedScore, getCurrentRoundId } from "@/lib/game-utils";

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
    console.error(`[engagement-tracker] Failed to fetch cast ${castHash}:`, error);
    return null;
  }
}

/**
 * Update engagement metrics for all active entries
 * This function should be called periodically (every 15-30 minutes)
 */
export async function updateEngagementMetrics() {
  try {
    console.log("[engagement-tracker] Starting engagement update...");

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      const error = new Error("Database is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.");
      console.error("[engagement-tracker] Supabase not configured:", error.message);
      throw error;
    }

    // Get all active entries from current and recent rounds
    const currentRoundId = getCurrentRoundId();
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
      console.log("[engagement-tracker] No entries to update");
      return {
        success: true,
        updated: 0,
      };
    }

    console.log(`[engagement-tracker] Found ${entries.length} entries to update`);

    let updated = 0;
    const updates = [];

    // Fetch engagement for each entry
    for (const entry of entries) {
      const engagement = await fetchCastEngagement(entry.cast_hash);

      if (!engagement) {
        console.log(`[engagement-tracker] Skipping entry ${entry.id} - no engagement data`);
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

    // NOTE: Engagement is now stored off-chain only (in Supabase).
    // Engagement data will be provided to finalizeRound() when finalizing each round.
    // This saves gas costs by avoiding periodic on-chain updates during the round.

    console.log(`[engagement-tracker] Updated ${updated} entries`);

    return {
      success: true,
      updated,
    };
  } catch (error) {
    console.error("[engagement-tracker] Error:", error);
    throw error;
  }
}

