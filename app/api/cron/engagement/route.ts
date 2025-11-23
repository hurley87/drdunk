import { NextRequest, NextResponse } from "next/server";
import { updateEngagementMetrics } from "@/lib/cron/engagement-tracker";
import { env } from "@/lib/env";

/**
 * Cron endpoint for updating engagement metrics
 * Should be called every 15-30 minutes
 * 
 * Configure in Vercel Cron or similar:
 * crons: [{ path: "/api/cron/engagement", schedule: "every 15 minutes" }]
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel Cron request
    // Vercel Cron automatically sends the x-vercel-cron header
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const cronSecret = env.CRON_SECRET;

    // If CRON_SECRET is set, also verify it via Authorization header (for custom cron services)
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}` && !vercelCronHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (!vercelCronHeader) {
      // If no CRON_SECRET is set, only allow Vercel Cron requests
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await updateEngagementMetrics();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/engagement] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

