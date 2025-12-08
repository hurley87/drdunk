import { NextRequest, NextResponse } from "next/server";
import { validateQuickAuth } from "@/lib/quick-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/game/claimable
 * Returns rounds where the authenticated user is the winner and can claim rewards
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await validateQuickAuth(request);

    if (!authResult) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const fid = authResult.fid;

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

    // Get rounds where user is the winner and status is "finalized" (not yet claimed)
    const { data: claimableRounds, error } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("winner_fid", fid)
      .eq("status", "finalized")
      .order("id", { ascending: false });

    if (error) {
      console.error("[game/claimable] Database error:", error);
      throw error;
    }

    // Calculate total claimable amount
    const totalClaimable = (claimableRounds || []).reduce(
      (sum, round) => sum + (round.pot_amount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        rounds: claimableRounds || [],
        totalClaimable,
        count: claimableRounds?.length || 0,
      },
    });
  } catch (error) {
    console.error("[game/claimable] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}



