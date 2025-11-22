import { Redis } from "@upstash/redis";
import { env } from "process";

if (!env.REDIS_URL || !env.REDIS_TOKEN) {
  console.warn(
    "REDIS_URL or REDIS_TOKEN environment variable is not defined, please add to enable background notifications and webhooks.",
  );
}

// Validate Redis URL format before creating client to avoid build-time errors
const isValidRedisUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const redis =
  env.REDIS_URL && env.REDIS_TOKEN && isValidRedisUrl(env.REDIS_URL)
    ? new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      })
    : null;
