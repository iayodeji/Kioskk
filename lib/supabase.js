import { createClient } from '@supabase/supabase-js';

function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function getServerEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function createBrowserSupabase() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

export function createServerSupabase() {
  const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();
  return createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
}

export default {
  createBrowserSupabase,
  createServerSupabase,
};
