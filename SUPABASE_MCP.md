Supabase MCP & local setup

Goal
- Show how to configure local env, install `@com.supabase/mcp`, and run MCP commands without sharing secrets in chat.

1) Add secrets locally (recommended)
- Copy `.env.local.template` to `.env.local` at the project root and fill the values.
- Make sure `.gitignore` prevents `.env.local` from being committed.

2) Install MCP (local dev)
- You can install the MCP package when you are ready. Example:

```bash
npm install --save-dev @com.supabase/mcp
```

3) Example usage (once env vars are set in your shell or `.env.local`)
- Run MCP to apply migrations, list branches, or run SQL. Example commands below assume `@com.supabase/mcp` binary is available via npx or npm script.

Apply migrations (local):
```bash
npx @com.supabase/mcp apply_migration --project-ref "$NEXT_PUBLIC_SUPABASE_URL" --service-role-key "$SUPABASE_SERVICE_ROLE_KEY" --path supabase/migrations
```

Run SQL:
```bash
npx @com.supabase/mcp execute_sql --project-ref "$NEXT_PUBLIC_SUPABASE_URL" --service-role-key "$SUPABASE_SERVICE_ROLE_KEY" --sql "SELECT 1"
```

Create a branch (if supported):
```bash
npx @com.supabase/mcp create_branch --project-ref "$NEXT_PUBLIC_SUPABASE_URL" --service-role-key "$SUPABASE_SERVICE_ROLE_KEY" --branch my-dev-branch
```

4) How I can help (pick one):
- I can add an npm script and helper functions in the repo to run MCP commands with env vars already loaded.
- I can add a small wrapper script `scripts/mcp.sh` (or `mcp.ps1` for Windows) that sources `.env.local` and runs the MCP CLI safely.

Security notes
- Never paste service role keys or DB credentials into public chat.
- Use short-lived keys where possible and prefer CI/deployment secret stores for production.

If you want, I can:
- Add an npm script + small wrapper that runs common MCP commands reading `.env.local` (I will create files with placeholders only; you provide the real `.env.local` locally).
- Or just show commands to run locally (no changes to the repo).

Which do you prefer?