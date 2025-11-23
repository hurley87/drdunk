import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentRoundId } from "@/lib/game-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roundIdParam = searchParams.get("roundId");
    const currentOnly = searchParams.get("current") === "true";

    if (currentOnly) {
      // Get current round
      const roundId = getCurrentRoundId();
      
      const { data: round, error: roundError } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (roundError && roundError.code !== "PGRST116") {
        throw roundError;
      }

      // Get entry count
      const { count } = await supabase
        .from("game_entries")
        .select("*", { count: "exact", head: true })
        .eq("round_id", roundId);

      return NextResponse.json({
        success: true,
        data: {
          round: round || {
            id: roundId,
            date: new Date(roundId * 86400000).toISOString().split("T")[0],
            pot_amount: 0,
            status: "active",
          },
          entryCount: count || 0,
        },
      });
    }

    // Get specific round or list of rounds
    if (roundIdParam) {
      const roundId = parseInt(roundIdParam, 10);
      
      const { data: round, error } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return NextResponse.json(
            {
              error: "Round not found",
            },
            { status: 404 }
          );
        }
        throw error;
      }

      // Get entry count
      const { count } = await supabase
        .from("game_entries")
        .select("*", { count: "exact", head: true })
        .eq("round_id", roundId);

      return NextResponse.json({
        success: true,
        data: {
          round,
          entryCount: count || 0,
        },
      });
    }

    // Get past rounds with winners
    const { data: rounds, error } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("status", "finalized")
      .order("id", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        rounds: rounds || [],
      },
    });
  } catch (error) {
    console.error("[game/rounds] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

