import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/nextjs
export const env = createEnv({
  server: {
    NEYNAR_API_KEY: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    REDIS_URL: z.string().min(1),
    REDIS_TOKEN: z.string().min(1),
    NEYNAR_WEBHOOK_SECRET: z.string().min(1),
    SIGNER_UUID: z.string().min(1),
    BOT_FID: z.coerce.number().int().positive(),
    SUPABASE_URL: z.string().min(1).optional(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    GAME_CONTRACT_ADDRESS: z.string().min(1).optional(),
    USDC_CONTRACT_ADDRESS: z.string().min(1).optional(),
    CRON_SECRET: z.string().min(1).optional(),
    CRON_WALLET_PRIVATE_KEY: z.string().min(1).optional(), // Private key for contract calls (owner wallet)
    BASE_RPC_URL: z.string().url().optional(), // Custom RPC URL for Base chain (server-side)
  },
  client: {
    NEXT_PUBLIC_URL: z.string().min(1),
    NEXT_PUBLIC_GAME_CONTRACT_ADDRESS: z.string().min(1).optional(),
    NEXT_PUBLIC_USDC_CONTRACT_ADDRESS: z.string().min(1).optional(),
    NEXT_PUBLIC_BASE_RPC_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "production"])
      .optional()
      .default("development"),
    NEXT_PUBLIC_FARCASTER_HEADER: z.string().min(1),
    NEXT_PUBLIC_FARCASTER_PAYLOAD: z.string().min(1),
    NEXT_PUBLIC_FARCASTER_SIGNATURE: z.string().min(1),
    NEXT_PUBLIC_BOT_FID: z.coerce.number().int().positive(),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_FARCASTER_HEADER: process.env.NEXT_PUBLIC_FARCASTER_HEADER,
    NEXT_PUBLIC_FARCASTER_PAYLOAD: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
    NEXT_PUBLIC_FARCASTER_SIGNATURE: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    NEXT_PUBLIC_BOT_FID: process.env.NEXT_PUBLIC_BOT_FID,
    NEXT_PUBLIC_GAME_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS,
    NEXT_PUBLIC_USDC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_BASE_RPC_URL: process.env.NEXT_PUBLIC_BASE_RPC_URL,
  },
});
