param(
  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]
  $Args
)

# Load .env.local from project root (one directory up from scripts)
$envFile = Join-Path $PSScriptRoot '..\.env.local'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $_ = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($_)) { return }
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*([^=]+?)\s*=\s*(.*)$') {
      $k = $matches[1].Trim()
      $v = $matches[2].Trim()
      if ($v -match '^"(.*)"$') { $v = $matches[1] }
      [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
    }
  }
} else {
  Write-Host "Warning: .env.local not found at $envFile" -ForegroundColor Yellow
}

# Run MCP CLI via npx forwarding all args
if ($Args.Count -eq 0) {
  Write-Host "Usage: npm run mcp -- <mcp-command> [options]" -ForegroundColor Cyan
  Write-Host "Example: npm run mcp -- apply_migration --project-ref \"$env:NEXT_PUBLIC_SUPABASE_URL\" --service-role-key \"$env:SUPABASE_SERVICE_ROLE_KEY\" --path supabase/migrations"
}

Write-Host "Running: npx @com.supabase/mcp $($Args -join ' ')" -ForegroundColor Green
& npx @com.supabase/mcp @Args
