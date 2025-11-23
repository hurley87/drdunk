export type NeynarWebhookEvent = {
  event?: string;
  type?: string;
  score?: number;
  user?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

export type GiftAnalysis = {
  isAskingForPresent: boolean;
  recipient: string | null;
  replyText: string;
};

export type CastReplyResponse = {
  success?: boolean;
  cast?: {
    hash: string;
    author: { fid: number };
    text: string;
  };
  // Neynar API response format
  result?: {
    cast: {
      hash: string;
      author: { fid: number };
      text: string;
    };
  };
};
