import { NeynarWebhookEvent } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function extractScore(payload: NeynarWebhookEvent): number | null {
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

export function extractMentionedFids(
  payload: NeynarWebhookEvent,
): number[] {
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

export function extractCastText(payload: NeynarWebhookEvent): string | null {
  if (isRecord(payload.data) && typeof payload.data.text === "string") {
    return payload.data.text;
  }
  return null;
}

export function extractCastHash(payload: NeynarWebhookEvent): string | null {
  if (isRecord(payload.data) && typeof payload.data.hash === "string") {
    return payload.data.hash;
  }
  return null;
}

export function extractAuthorFid(payload: NeynarWebhookEvent): number | null {
  if (isRecord(payload.data)) {
    const author = payload.data.author;
    if (isRecord(author) && typeof author.fid === "number") {
      return author.fid;
    }
  }
  return null;
}

export function extractEventName(payload: NeynarWebhookEvent): string {
  return payload.event ?? payload.type ?? "unknown";
}
