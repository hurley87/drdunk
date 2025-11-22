import { NextRequest, NextResponse } from "next/server";
import { validateQuickAuth } from "@/lib/quick-auth";

export async function GET(request: NextRequest) {
  const authResult = await validateQuickAuth(request);

  if (!authResult) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "User is authenticated",
    fid: authResult.fid,
  });
}
