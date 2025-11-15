import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const SIGNATURE_HEADER = "x-neynar-signature";
const SCORE_THRESHOLD = 0.2;
const REQUIRED_KEYWORDS = ["present", "gift"];

type NeynarWebhookEvent = {
  event?: string;
  type?: string;
  score?: number;
  user?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

const giftAnalysisSchema = z.object({
  isAskingForPresent: z
    .boolean()
    .describe("Whether the user is asking for a present/gift"),
  recipient: z
    .string()
    .nullable()
    .describe("The intended recipient of the gift, or null if not specified"),
  replyText: z
    .string()
    .describe(
      "A friendly reply message - either remind them they can ask for a present, or offer to let them buy one",
    ),
});

function verifyNeynarSignature(body: string, signature: string | null) {
  const secret = env.NEYNAR_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = Buffer.from(
    createHmac("sha512", secret).update(body).digest("hex"),
  );

  const provided = Buffer.from(signature);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function extractScore(payload: NeynarWebhookEvent): number | null {
  if (typeof payload.score === "number") {
    return payload.score;
  }

  const nestedSources: Array<Record<string, unknown> | undefined> = [
    payload.user,
    payload.data,
  ];

  for (const source of nestedSources) {
    if (!isRecord(source)) continue;

    if (typeof source.score === "number") {
      return source.score;
    }

    const nestedUser = source.user;
    if (isRecord(nestedUser) && typeof nestedUser.score === "number") {
      return nestedUser.score;
    }

    const nestedAuthor = source.author;
    if (isRecord(nestedAuthor) && typeof nestedAuthor.score === "number") {
      return nestedAuthor.score;
    }
  }

  return null;
}

function extractMentionedFids(payload: NeynarWebhookEvent): number[] {
  const fids: number[] = [];

  if (isRecord(payload.data)) {
    const mentionedProfiles = payload.data.mentioned_profiles;
    if (Array.isArray(mentionedProfiles)) {
      for (const profile of mentionedProfiles) {
        if (isRecord(profile) && typeof profile.fid === "number") {
          fids.push(profile.fid);
        }
      }
    }
  }

  return fids;
}

function extractCastText(payload: NeynarWebhookEvent): string | null {
  if (isRecord(payload.data) && typeof payload.data.text === "string") {
    return payload.data.text;
  }
  return null;
}

function extractCastHash(payload: NeynarWebhookEvent): string | null {
  if (isRecord(payload.data) && typeof payload.data.hash === "string") {
    return payload.data.hash;
  }
  return null;
}

function extractAuthorFid(payload: NeynarWebhookEvent): number | null {
  if (isRecord(payload.data)) {
    const author = payload.data.author;
    if (isRecord(author) && typeof author.fid === "number") {
      return author.fid;
    }
  }
  return null;
}

function hasRequiredKeywords(text: string | null): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return REQUIRED_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

async function analyzeGiftIntent(castText: string) {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: giftAnalysisSchema,
    prompt: `You are Dr. Dunk, a gift-giving bot on Farcaster. Analyze this cast to determine if the user wants to buy a present for someone else.

IMPORTANT RULES:
1. Users can ONLY buy presents for OTHER PEOPLE, not for themselves.
2. NEVER use @mentions or usernames in your reply text - this could create infinite loops!
3. Keep replies generic and friendly without addressing specific users by name.

Cast text: "${castText}"

Determine:
1. Is the user asking to buy a present for someone else? (Look for mentions of other people, usernames, or requests to gift someone)
2. Who is the intended recipient? (Must be someone other than the asker - look for @mentions, names, or references to other people)
3. Generate a friendly reply WITHOUT using any @mentions or usernames:
   - If they're asking for a present for THEMSELVES: Politely explain they can only buy presents for OTHER PEOPLE, and encourage them to pick someone to gift
   - If they're asking to buy a present for SOMEONE ELSE: Acknowledge their generosity and tell them they can proceed to buy one (be enthusiastic!)
   - If they're just mentioning the keywords without clear intent: Remind them they can buy presents for friends and other people on Farcaster

Keep the tone fun and encouraging, but NEVER include @mentions or usernames!`,
  });

  return result.object;
}

async function postCastReply(
  text: string,
  parentHash: string,
  parentAuthorFid: number,
  embedUrl: string,
) {
  const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.NEYNAR_API_KEY,
    },
    body: JSON.stringify({
      signer_uuid: env.SIGNER_UUID,
      text,
      parent: parentHash,
      parent_author_fid: parentAuthorFid,
      embeds: [{ url: embedUrl }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post cast reply: ${error}`);
  }

  return response.json();
}

// [drdunk] Neynar webhook event cast.created {
//   created_at: 1763136659,
//   type: 'cast.created',
//   data: {
//     object: 'cast',
//     hash: '0x4bfa9c299622614ddf8626523d826d8413aa5443',
//     author: {
//       object: 'user',
//       fid: 1025624,
//       username: 'commodus',
//       display_name: 'Commodus',
//       pfp_url: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/03205d5f-86ac-4407-0c19-23484c603e00/original',
//       custody_address: '0x5ff2e4f99f6bb03d44fe8ac2696ec02374d601ad',
//       profile: [Object],
//       follower_count: 3,
//       following_count: 9,
//       verifications: [Array],
//       verified_addresses: [Object],
//       auth_addresses: [Array],
//       verified_accounts: [],
//       power_badge: false,
//       experimental: [Object],
//       score: 0.32
//     },
//     app: {
//       object: 'user_dehydrated',
//       fid: 9152,
//       username: 'warpcast',
//       display_name: 'Warpcast',
//       pfp_url: 'https://i.imgur.com/3d6fFAI.png',
//       custody_address: '0x02ef790dd7993a35fd847c053eddae940d055596'
//     },
//     thread_hash: '0x4bfa9c299622614ddf8626523d826d8413aa5443',
//     parent_hash: null,
//     parent_url: null,
//     root_parent_url: null,
//     parent_author: { fid: null },
//     text: '@hurls hey',
//     timestamp: '2025-11-14T16:10:54.000Z',
//     embeds: [],
//     channel: null,
//     reactions: { likes_count: 0, recasts_count: 0, likes: [], recasts: [] },
//     replies: { count: 0 },
//     mentioned_profiles: [ [Object] ],
//     mentioned_profiles_ranges: [ [Object] ],
//     mentioned_channels: [],
//     mentioned_channels_ranges: [],
//     event_timestamp: '2025-11-14T16:10:59.786Z'
//   }
// }

export async function POST(request: Request) {
  const rawBody = await request.text();
  console.log("[drdunk] Neynar webhook event", rawBody);

  let eventPayload: NeynarWebhookEvent;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid Neynar webhook payload" },
      { status: 400 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER);
  const verified = verifyNeynarSignature(rawBody, signature);

  if (!verified) {
    return NextResponse.json(
      { error: "Invalid Neynar webhook signature" },
      { status: 401 },
    );
  }

  const score = extractScore(eventPayload);
  if (score !== null && score <= SCORE_THRESHOLD) {
    console.warn("[drdunk] Neynar score is too low", score, eventPayload);
    return NextResponse.json({ error: "Score is too low" }, { status: 403 });
  }

  // Check if the cast author is the bot itself to prevent infinite loops
  const authorFid = extractAuthorFid(eventPayload);
  if (authorFid === env.BOT_FID) {
    console.log("[drdunk] Ignoring cast from bot itself to prevent loop");
    return NextResponse.json(
      { success: true, message: "Ignored own cast" },
      { status: 200 },
    );
  }

  const castText = extractCastText(eventPayload);
  if (!hasRequiredKeywords(castText)) {
    console.warn("[drdunk] No required keywords present in cast text", castText);
    return NextResponse.json(
      { error: "No required keywords present" },
      { status: 403 },
    );
  }

  const eventName = eventPayload.event ?? eventPayload.type ?? "unknown";
  const mentionedFids = extractMentionedFids(eventPayload);
  const castHash = extractCastHash(eventPayload);

  console.log("[drdunk] Neynar webhook event", eventName, eventPayload);
  console.log("[drdunk] Mentioned FIDs:", mentionedFids);
  console.log("[drdunk] Cast text:", castText);
  console.log("[drdunk] Cast hash:", castHash);
  console.log("[drdunk] Author FID:", authorFid);

  // Analyze the gift intent with LLM
  let giftAnalysis;
  try {
    giftAnalysis = await analyzeGiftIntent(castText!);
    console.log("[drdunk] Gift analysis:", giftAnalysis);
  } catch (error) {
    console.error("[drdunk] Failed to analyze gift intent:", error);

    // Handle specific error types
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const statusCode =
      errorMessage.includes("rate limit") ||
      errorMessage.includes("429") ||
      errorMessage.includes("quota")
        ? 429
        : errorMessage.includes("401") || errorMessage.includes("unauthorized")
          ? 401
          : 500;

    return NextResponse.json(
      {
        error: "Failed to analyze gift intent",
        message: errorMessage,
        type:
          statusCode === 429
            ? "rate_limit"
            : statusCode === 401
              ? "auth_error"
              : "api_error",
      },
      { status: statusCode },
    );
  }

  // Post the reply cast
  let castReply;
  try {
    if (!castHash || !authorFid) {
      throw new Error("Missing cast hash or author FID");
    }

    // Build embed URL with mentioned FIDs as query parameters
    const embedUrl = new URL(env.NEXT_PUBLIC_URL);
    if (mentionedFids.length > 0) {
      embedUrl.searchParams.set("fids", mentionedFids.join(","));
    }

    castReply = await postCastReply(
      giftAnalysis.replyText,
      castHash,
      authorFid,
      embedUrl.toString(),
    );
    console.log("[drdunk] Posted reply cast:", castReply);
  } catch (error) {
    console.error("[drdunk] Failed to post reply cast:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to post reply cast",
        message: errorMessage,
        giftAnalysis,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      mentionedFids,
      giftAnalysis,
      castReply,
    },
    { status: 200 },
  );
}
