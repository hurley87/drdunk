import { NextRequest, NextResponse } from "next/server";
import { validateQuickAuth } from "@/lib/quick-auth";
import { supabase } from "@/lib/supabase";

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
    const { searchParams } = new URL(request.url);
    const roundIdParam = searchParams.get("roundId");

    if (!roundIdParam) {
      return NextResponse.json(
        {
          error: "Round ID required",
        },
        { status: 400 }
      );
    }

    const roundId = parseInt(roundIdParam, 10);

    // Get user's entry for this round
    const { data: entry, error } = await supabase
      .from("game_entries")
      .select("*")
      .eq("round_id", roundId)
      .eq("fid", fid)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: entry || null,
    });
  } catch (error) {
    console.error("[game/entries] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

