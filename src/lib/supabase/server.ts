import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv, getSupabasePublicEnv } from "@/lib/env";

export function createServerSupabase() {
  const { supabaseUrl } = getSupabasePublicEnv();
  const { supabaseServiceRoleKey } = getServerEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
