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
 * Post a cast as a reply to another cast
 * @param text The text content of the cast
 * @param parentCastUrlOrHash Parent cast URL or hash (required)
 * @returns The cast response with hash and other metadata
 */
export async function postDunkCast(
  text: string,
  parentCastUrlOrHash: string
): Promise<CastReplyResponse> {
  const body: any = {
    signer_uuid: env.SIGNER_UUID,
    text,
  };

  // Extract cast hash from URL or use directly if it's already a hash
  let castHash = parentCastUrlOrHash.trim();
  
  // If it's a URL, extract the hash from the last segment
  if (castHash.includes("/")) {
    const urlParts = castHash.split("/");
    castHash = urlParts[urlParts.length - 1];
  }
  
  // Validate that we have a valid cast hash (starts with 0x and is hex)
  if (castHash && castHash.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(castHash)) {
    body.parent = castHash;
  } else {
    throw new Error(`Invalid cast hash format: ${castHash}. Expected a cast hash (0x...) or cast URL.`);
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
