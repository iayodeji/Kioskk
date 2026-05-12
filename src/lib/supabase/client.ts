import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env";

export function createBrowserSupabase() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

