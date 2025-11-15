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
