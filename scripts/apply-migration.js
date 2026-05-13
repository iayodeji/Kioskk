#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, "../supabase/migrations/0001_init.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("📦 Applying migration: 0001_init.sql");
    console.log("🔗 Project:", supabaseUrl);

    // Extract project ref from URL
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

    // Build the database connection URL for the service role
    // Format: postgres://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
    const parts = supabaseServiceRoleKey.split(".");
    if (parts.length < 1) {
      throw new Error("Invalid service role key format");
    }

    // Construct a connection URL (this is a simplification; actual implementation would need the DB password)
    // For now, use the Supabase REST API to execute SQL statements
    const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // Execute SQL statements one by one through a custom approach
    // Split by semicolons and execute individual statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // For REST API approach, we need to use a stored function or similar
    // Since we can't execute arbitrary SQL directly via JS SDK, use the raw fetch with RPC
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/pg_sql_ast_to_statement`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      }
    ).catch(() => null);

    // Fallback: Log that we need direct DB access
    console.log("\n⚠️  Direct SQL execution via REST API requires a custom Postgres function.");
    console.log("📌 To complete the migration, please:");
    console.log(`   1. Login to Supabase dashboard: https://app.supabase.com/projects`);
    console.log(`   2. Navigate to project: ${projectRef}`);
    console.log(`   3. Open SQL Editor`);
    console.log(`   4. Create new query and paste the contents of: supabase/migrations/0001_init.sql`);
    console.log(`   5. Click 'Run'`);

    process.exit(1);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

applyMigration();
