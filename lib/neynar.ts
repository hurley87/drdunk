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
 * Fetch cast by URL or hash using Neynar API
 * @param identifier Cast URL or hash
 * @returns Cast data or null if not found
 */
export const fetchCast = async (identifier: string): Promise<NeynarCast | null> => {
  const trimmed = identifier.trim();
  
  // Determine if it's a URL or hash
  const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://");
  const type = isUrl ? "url" : "hash";
  
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(trimmed)}&type=${type}`,
      {
        headers: {
          "x-api-key": env.NEYNAR_API_KEY!,
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch cast: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const cast = data.cast || data.result?.cast;
    
    if (!cast) {
      return null;
    }
    
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
  } catch (error) {
    console.error("Failed to fetch cast:", error);
    throw error;
  }
};
