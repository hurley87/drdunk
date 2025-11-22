import { sendFrameNotification } from "@/lib/notification-client";
import { NextRequest, NextResponse } from "next/server";
import { validateQuickAuth } from "@/lib/quick-auth";

export async function POST(request: NextRequest) {
  // Verify authentication
  const authResult = await validateQuickAuth(request);

  if (!authResult) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { fid, notification } = body;

    // Verify that the authenticated user matches the fid in the request
    if (fid !== authResult.fid) {
      return NextResponse.json(
        { error: "Forbidden: Cannot send notifications for other users" },
        { status: 403 }
      );
    }

    const result = await sendFrameNotification({
      fid,
      title: notification.title,
      body: notification.body,
      notificationDetails: notification.notificationDetails,
    });

    if (result.state === "error") {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
