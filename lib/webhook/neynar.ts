import { env } from "@/lib/env";
import { CastReplyResponse } from "./types";

export async function postCastReply(
  text: string,
  parentHash: string,
  parentAuthorFid: number,
  embedUrl: string,
): Promise<CastReplyResponse> {
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

export function buildEmbedUrl(baseUrl: string, fids: number[]): string {
  const embedUrl = new URL(baseUrl);
  if (fids.length > 0) {
    embedUrl.searchParams.set("fids", fids.join(","));
  }
  return embedUrl.toString();
}

/**
 * Post a standalone cast (not a reply)
 * @param text The text content of the cast
 * @param parentCastUrl Optional parent cast URL if this is a reply
 * @returns The cast response with hash and other metadata
 */
export async function postDunkCast(
  text: string,
  parentCastUrl?: string
): Promise<CastReplyResponse> {
  const body: any = {
    signer_uuid: env.SIGNER_UUID,
    text,
  };

  // If parentCastUrl is provided, parse it and add as parent
  if (parentCastUrl) {
    // Extract cast hash from URL (format: https://warpcast.com/username/0x...)
    const urlParts = parentCastUrl.split("/");
    const castHash = urlParts[urlParts.length - 1];
    
    if (castHash && castHash.startsWith("0x")) {
      body.parent = castHash;
    }
  }

  const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.NEYNAR_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post cast: ${error}`);
  }

  const result = await response.json();
  
  // Handle both response formats
  if (result.result?.cast) {
    return {
      success: true,
      cast: result.result.cast,
    };
  }
  
  return result;
}
