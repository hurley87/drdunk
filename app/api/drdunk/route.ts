import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

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

function hasRequiredKeywords(text: string | null): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return REQUIRED_KEYWORDS.some((keyword) => lowerText.includes(keyword));
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

  console.log("[drdunk] Neynar webhook event", eventName, eventPayload);
  console.log("[drdunk] Mentioned FIDs:", mentionedFids);

  return NextResponse.json(
    { success: true, mentionedFids },
    { status: 200 },
  );
}
