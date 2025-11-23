import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentRoundId } from "@/lib/game-utils";

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
    const roundIdParam = searchParams.get("roundId");
    
    const roundId = roundIdParam 
      ? parseInt(roundIdParam, 10) 
      : getCurrentRoundId();

    // Get all entries for the round, ordered by engagement score (descending)
    // Secondary sort by created_at (ascending) to match contract tiebreaker logic:
    // earliest entry wins in case of identical engagement scores
    const { data: entries, error } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", roundId)
      .order("engagement_score", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[game/leaderboard] Database error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch leaderboard",
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Format entries with ranking
    const leaderboard = entries?.map((entry, index) => ({
      rank: index + 1,
      fid: entry.fid,
      castHash: entry.cast_hash,
      castUrl: entry.cast_url,
      dunkText: entry.dunk_text,
      engagementScore: parseFloat(entry.engagement_score || "0"),
      likes: entry.likes,
      recasts: entry.recasts,
      replies: entry.replies,
      createdAt: entry.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        roundId,
        leaderboard,
      },
    });
  } catch (error) {
    console.error("[game/leaderboard] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

