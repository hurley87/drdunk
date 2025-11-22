import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";
import { validateQuickAuth } from "@/lib/quick-auth";

export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = await validateQuickAuth(request);

  if (!authResult) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const user = await fetchUser(authResult.fid.toString());
  return NextResponse.json(user);
}
