import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let supabaseClient: SupabaseClient | null = null;

/**
 * Check if Supabase is configured with required environment variables
 */
export function isSupabaseConfigured(): boolean {
  return !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

/**
 * Get or create the Supabase client instance.
 * Uses lazy initialization to avoid build-time errors when env vars are not set.
 * @throws Error if Supabase is not configured
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Runtime check for Supabase environment variables
  // These are optional at build time but required at runtime
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase environment variables are required. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables."
    );
  }

  supabaseClient = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
  return supabaseClient;
}

// Export a Proxy that lazily initializes the client on first access
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

