# Refactored Vultr Deployment Readiness

## Status: BLOCKED

GitHub `main` at `70ff72a` is a validated replacement candidate, but not a
deployment-ready server release. The repository cannot establish server state.

## Ready From Repository Evidence

- `npm ci` succeeds with the committed lockfile.
- Main Bot entry is `npm start` / `node src/index.js`.
- Required Bot environment variable is `DISCORD_TOKEN`.
- `OPENAI_API_KEY` is optional and has a verified fallback contract.
- No database schema change or data schema migration was introduced by the
  Community refactor.

## Required Before Deployment

- Read-only audit of the Vultr process manager, release layout, Node version,
  logs, `.env`, and live data location.
- Verified backup and preservation method for mutable `src/data/`, especially
  `onboarding-flows.json`.
- Confirmation of Developer Portal privileged intents and live Bot role
  permissions/position.
- Explicit decision whether Dashboard/Supabase is deployed; apply its separate
  environment and schema checks only when it is enabled.

## Prohibited Until Cleared

Do not SSH for deployment, restart the Bot, replace files, or run slash-command
deployment from this readiness slice.
