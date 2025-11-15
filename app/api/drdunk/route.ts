import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import {
  type NeynarWebhookEvent,
  extractScore,
  extractMentionedFids,
  extractCastText,
  extractCastHash,
  extractAuthorFid,
  extractEventName,
  hasRequiredKeywords,
  meetsScoreThreshold,
  isOwnCast,
  verifyNeynarSignature,
  analyzeGiftIntent,
  getErrorType,
  getErrorStatusCode,
  postCastReply,
  buildEmbedUrl,
} from "@/lib/webhook";

const SIGNATURE_HEADER = "x-neynar-signature";
const SCORE_THRESHOLD = 0.2;

export async function POST(request: Request) {
  // Parse webhook payload
  const rawBody = await request.text();
  console.log("[drdunk] Received webhook event");

  let eventPayload: NeynarWebhookEvent;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 },
    );
  }

  // Verify signature
  const signature = request.headers.get(SIGNATURE_HEADER);
  if (!verifyNeynarSignature(rawBody, signature, env.NEYNAR_WEBHOOK_SECRET)) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  // Extract event data
  const score = extractScore(eventPayload);
  const authorFid = extractAuthorFid(eventPayload);
  const castText = extractCastText(eventPayload);
  const castHash = extractCastHash(eventPayload);
  const mentionedFids = extractMentionedFids(eventPayload);
  const eventName = extractEventName(eventPayload);

  // Validation checks
  if (!meetsScoreThreshold(score, SCORE_THRESHOLD)) {
    console.warn("[drdunk] Score too low:", score);
    return NextResponse.json({ error: "Score too low" }, { status: 403 });
  }

  if (isOwnCast(authorFid, env.BOT_FID)) {
    console.log("[drdunk] Ignoring own cast");
    return NextResponse.json(
      { success: true, message: "Ignored own cast" },
      { status: 200 },
    );
  }

  if (!hasRequiredKeywords(castText)) {
    console.warn("[drdunk] No required keywords");
    return NextResponse.json(
      { error: "No required keywords" },
      { status: 403 },
    );
  }

  // Log extracted data
  console.log("[drdunk] Event:", eventName);
  console.log("[drdunk] Cast text:", castText);
  console.log("[drdunk] Mentioned FIDs:", mentionedFids);

  // Analyze gift intent
  let giftAnalysis;
  try {
    giftAnalysis = await analyzeGiftIntent(castText!);
    console.log("[drdunk] Analysis:", giftAnalysis);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode = getErrorStatusCode(errorMessage);
    const errorType = getErrorType(errorMessage);

    console.error("[drdunk] LLM error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to analyze intent",
        message: errorMessage,
        type: errorType,
      },
      { status: statusCode },
    );
  }

  // Post reply cast
  try {
    if (!castHash || !authorFid) {
      throw new Error("Missing cast hash or author FID");
    }

    const embedUrl = buildEmbedUrl(env.NEXT_PUBLIC_URL, mentionedFids);
    const castReply = await postCastReply(
      giftAnalysis.replyText,
      castHash,
      authorFid,
      embedUrl,
    );

    console.log("[drdunk] Reply posted:", castReply);

    return NextResponse.json(
      {
        success: true,
        mentionedFids,
        giftAnalysis,
        castReply,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("[drdunk] Cast error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to post reply",
        message: errorMessage,
        giftAnalysis,
      },
      { status: 500 },
    );
  }
}
