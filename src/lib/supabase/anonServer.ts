import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/env";

export function createAnonServerSupabase() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

