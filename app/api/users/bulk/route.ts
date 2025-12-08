import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export interface BulkUserInfo {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

/**
 * Fetch user info for multiple FIDs from Neynar API
 * GET /api/users/bulk?fids=123,456,789
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fidsParam = url.searchParams.get("fids");

  if (!fidsParam) {
    return NextResponse.json(
      { success: false, error: "Missing fids parameter" },
      { status: 400 }
    );
  }

  // Parse and validate FIDs
  const fids = fidsParam
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  if (fids.length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid FIDs provided" },
      { status: 400 }
    );
  }

  // Neynar supports up to 100 FIDs at a time
  if (fids.length > 100) {
    return NextResponse.json(
      { success: false, error: "Maximum 100 FIDs allowed per request" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(",")}`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[users/bulk] Neynar API error:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to fetch users from Neynar" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Map to simplified user info
    const users: Record<string, BulkUserInfo> = {};
    for (const user of data.users || []) {
      users[user.fid] = {
        fid: user.fid,
        username: user.username || `fid:${user.fid}`,
        display_name: user.display_name || user.username || `FID ${user.fid}`,
        pfp_url: user.pfp_url || "",
      };
    }

    return NextResponse.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("[users/bulk] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}



