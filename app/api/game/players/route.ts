import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message: "Database is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    // Validate limit is a positive integer, default to 50 if invalid
    const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 50;

    // Get all entries with their engagement scores
    const { data: playerStats, error } = await supabase
      .from("game_entries")
      .select("fid, engagement_score, round_id");

    if (error) {
      console.error("[game/players] Database error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch player stats",
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Aggregate stats by player
    const statsMap = new Map<
      number,
      {
        fid: number;
        totalEntries: number;
        totalWins: number;
        totalEngagementScore: number;
        bestEngagementScore: number;
        roundsPlayed: Set<number>;
      }
    >();

    // Get all rounds to check winners
    const { data: rounds } = await supabase
      .from("game_rounds")
      .select("id, winner_fid")
      .eq("status", "finalized");

    const winnerMap = new Map<number, number>();
    rounds?.forEach((round) => {
      if (round.winner_fid) {
        winnerMap.set(round.id, round.winner_fid);
      }
    });

    // Process entries
    playerStats?.forEach((entry: any) => {
      const fid = entry.fid;
      const engagementScore = parseFloat(entry.engagement_score || "0");
      const roundId = entry.round_id;
      const isWinner = winnerMap.get(roundId) === fid;

      if (!statsMap.has(fid)) {
        statsMap.set(fid, {
          fid,
          totalEntries: 0,
          totalWins: 0,
          totalEngagementScore: 0,
          bestEngagementScore: 0,
          roundsPlayed: new Set(),
        });
      }

      const stats = statsMap.get(fid)!;
      stats.totalEntries += 1;
      stats.roundsPlayed.add(roundId);
      stats.totalEngagementScore += engagementScore;
      stats.bestEngagementScore = Math.max(
        stats.bestEngagementScore,
        engagementScore
      );
      if (isWinner) {
        stats.totalWins += 1;
      }
    });

    // Convert to array and calculate win rate
    const players = Array.from(statsMap.values())
      .map((stats) => ({
        fid: stats.fid,
        totalEntries: stats.totalEntries,
        totalWins: stats.totalWins,
        totalRoundsPlayed: stats.roundsPlayed.size,
        winRate: stats.roundsPlayed.size > 0 
          ? (stats.totalWins / stats.roundsPlayed.size) * 100 
          : 0,
        totalEngagementScore: stats.totalEngagementScore,
        averageEngagementScore: stats.totalEntries > 0
          ? stats.totalEngagementScore / stats.totalEntries
          : 0,
        bestEngagementScore: stats.bestEngagementScore,
      }))
      .sort((a, b) => {
        // Sort by total wins (desc), then by best engagement score (desc)
        if (b.totalWins !== a.totalWins) {
          return b.totalWins - a.totalWins;
        }
        return b.bestEngagementScore - a.bestEngagementScore;
      })
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

    return NextResponse.json({
      success: true,
      data: {
        players,
      },
    });
  } catch (error) {
    console.error("[game/players] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

