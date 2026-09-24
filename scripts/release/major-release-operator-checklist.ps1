param(
  [ValidateSet('read-only', 'execute')]
  [string]$Mode = 'read-only'
)

$required = @(
  'docs/release/MAJOR_RELEASE_FINAL_REVIEW.md',
  'docs/release/SERVER_GOVERNANCE_DELETE_MANIFEST.md',
  'docs/release/SERVER_GOVERNANCE_PERMISSION_MANIFEST.md'
)

foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing release evidence: $path" }
}

if ($Mode -eq 'execute') {
  throw 'Execution is intentionally not automated. Obtain a fresh read-only inventory, human approval, a verified immutable plan, and a separately authorized operator procedure.'
}

Write-Output 'Read-only release checklist is present. No SSH, PM2, Discord API, or deployment action was performed.'
