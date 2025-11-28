import { NextRequest, NextResponse } from "next/server";
import { fetchCast } from "@/lib/neynar";

/**
 * API endpoint to lookup a cast by URL or hash
 * This is needed because the Neynar API key is server-side only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identifier");

    if (!identifier) {
      return NextResponse.json(
        { error: "Cast identifier (URL or hash) is required" },
        { status: 400 }
      );
    }

    const cast = await fetchCast(identifier);

    if (!cast) {
      return NextResponse.json(
        { error: "Cast not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, cast });
  } catch (error) {
    console.error("[cast/lookup] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to lookup cast",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


