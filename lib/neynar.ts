import { env } from "@/lib/env";

export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
}

export interface NeynarCast {
  hash: string;
  text: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  };
  timestamp: string;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
}

export const fetchUser = async (fid: string): Promise<NeynarUser> => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch Farcaster user on Neynar",
      await response.json()
    );
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = await response.json();
  return data.users[0];
};

/**
 * Extract cast hash from a Warpcast URL
 * Handles formats like:
 * - https://warpcast.com/username/0x123abc
 * - https://warpcast.com/~/conversations/0x123abc
 * @param url The Warpcast URL
 * @returns The cast hash or null if not found
 */
function extractHashFromWarpcastUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Find the hash in the path (starts with 0x)
    for (const part of pathParts) {
      if (part.startsWith('0x') && /^0x[a-fA-F0-9]+$/.test(part)) {
        return part;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalize a URL or hash identifier for cast lookup
 * - Adds https:// to URLs without protocol
 * - Handles various Warpcast URL formats
 * @param identifier The raw identifier from user input
 * @returns Object with normalized identifier and type
 */
function normalizeIdentifier(identifier: string): { normalized: string; type: "url" | "hash" } {
  const trimmed = identifier.trim();
  
  // Check if it's already a proper URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { normalized: trimmed, type: "url" };
  }
  
  // Check if it's a URL without protocol (e.g., warpcast.com/...)
  if (trimmed.startsWith("warpcast.com/") || trimmed.startsWith("www.warpcast.com/")) {
    return { normalized: `https://${trimmed}`, type: "url" };
  }
  
  // Check if it's a hash (starts with 0x)
  if (trimmed.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(trimmed)) {
    return { normalized: trimmed, type: "hash" };
  }
  
  // Default to treating as hash (will fail gracefully if invalid)
  return { normalized: trimmed, type: "hash" };
}

/**
 * Fetch cast by URL or hash using Neynar API
 * @param identifier Cast URL or hash
 * @returns Cast data or null if not found
 */
export const fetchCast = async (identifier: string): Promise<NeynarCast | null> => {
  const { normalized, type } = normalizeIdentifier(identifier);
  
  console.log("[fetchCast] Input:", { identifier, normalized, type });
  
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(normalized)}&type=${type}`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY!,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("[fetchCast] Initial request failed:", { status: response.status, errorData, type });
      
      // If URL lookup failed, try extracting hash from URL and retry with hash type
      if (type === "url") {
        const extractedHash = extractHashFromWarpcastUrl(normalized);
        if (extractedHash) {
          console.log("[fetchCast] Retrying with extracted hash:", extractedHash);
          const hashResponse = await fetch(
            `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(extractedHash)}&type=hash`,
            {
              headers: {
                "x-api-key": env.NEYNAR_API_KEY!,
              },
            }
          );
          
          if (hashResponse.ok) {
            const hashData = await hashResponse.json();
            const cast = hashData.cast || hashData.result?.cast;
            
            if (cast) {
              return formatCastResponse(cast);
            }
          }
        }
      }
      
      throw new Error(`Failed to fetch cast: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const cast = data.cast || data.result?.cast;
    
    if (!cast) {
      return null;
    }
    
    return formatCastResponse(cast);
  } catch (error) {
    console.error("[fetchCast] Error:", error);
    throw error;
  }
};

/**
 * Format raw cast response to NeynarCast interface
 */
function formatCastResponse(cast: any): NeynarCast {
  return {
    hash: cast.hash,
    text: cast.text,
    author: {
      fid: cast.author.fid,
      username: cast.author.username,
      display_name: cast.author.display_name,
      pfp_url: cast.author.pfp_url,
    },
    timestamp: cast.timestamp,
    reactions: {
      likes_count: cast.reactions?.likes_count || 0,
      recasts_count: cast.reactions?.recasts_count || 0,
    },
    replies: {
      count: cast.replies?.count || 0,
    },
  };
}
