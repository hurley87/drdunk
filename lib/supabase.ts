import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Check if Supabase is configured with required environment variables
 */
export function isSupabaseConfigured(): boolean {
  return !!(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY));
}

/**
 * Check if Supabase admin client is configured (requires service role key)
 */
export function isSupabaseAdminConfigured(): boolean {
  return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Get or create the Supabase client instance (uses anon key, respects RLS).
 * Uses lazy initialization to avoid build-time errors when env vars are not set.
 * @throws Error if Supabase is not configured
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Runtime check for Supabase environment variables
  // These are optional at build time but required at runtime
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are required. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables."
    );
  }

  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  return supabaseClient;
}

/**
 * Get or create the Supabase admin client instance (uses service role key, bypasses RLS).
 * Use this for server-side operations that need write access to tables with RLS enabled.
 * @throws Error if Supabase admin is not configured
 */
function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase service role key is required for admin operations. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables."
    );
  }

  supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseAdminClient;
}

// Export a Proxy that lazily initializes the anon client on first access
// Use this for read-only operations or when RLS should be enforced
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Export a Proxy that lazily initializes the admin client on first access
// Use this for server-side write operations that need to bypass RLS
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

