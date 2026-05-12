export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getPublicEnv() {
  return {
    supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    domain: process.env.NEXT_PUBLIC_DOMAIN || "kioskk.me",
  };
}

export function getServerEnv() {
  return {
    anthropicApiKey: requireEnv("ANTHROPIC_API_KEY"),
    supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    adminPin: requireEnv("ADMIN_PIN"),
    jwtSecret: requireEnv("JWT_SECRET"),
  };
}

