# Refactored Vultr Deployment Readiness

## Status: READY_FOR_BACKUP

GitHub `main` is a validated replacement candidate, but not a deployment-ready
server release. Operations Slice #95 reconciled verified manual server evidence:
PM2 manages the Bot, the current checkout is dirty, live JSON state is inside
the checkout, the dashboard is not deployed, and disk capacity is sufficient.

The next safe action is a separately approved production backup. No backup,
staging, cutover, restart, or server write has occurred.

## Ready From Repository Evidence

- `npm ci` succeeds with the committed lockfile.
- Main Bot entry is `npm start` / `node src/index.js`.
- Required Bot environment variable is `DISCORD_TOKEN`.
- `OPENAI_API_KEY` is optional and has a verified fallback contract.
- No database schema change or data schema migration was introduced by the
  Community refactor.

## Required Before Deployment

- Verified backup and preservation method for mutable `src/data/`, especially
  `onboarding-flows.json`, plus `src/legacy/data` and `.env`.
- Confirmation of Developer Portal privileged intents and live Bot role
  permissions/position.
- Explicit decision whether Dashboard/Supabase is deployed; apply its separate
  environment and schema checks only when it is enabled.

## Prohibited Until Cleared

Do not stage, restart the Bot, replace files, or run slash-command deployment
until the backup is completed and verified.
