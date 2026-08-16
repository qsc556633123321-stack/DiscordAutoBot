# Production Environment Variable Inventory

Values are intentionally excluded. This inventory lists names only.

## Required For Bot Runtime

| Variable | Evidence | Notes |
| --- | --- | --- |
| `DISCORD_TOKEN` | `src/index.js` exits when absent | Required for `npm start` and bot login. |

## Required Only For Slash-Command Deployment

| Variable | Notes |
| --- | --- |
| `DISCORD_TOKEN` | REST authentication. |
| `CLIENT_ID` | `src/deploy-commands.js` exits when absent. |
| `GUILD_ID` | Optional; selects guild-scoped rather than global command deployment. |

## Optional Bot Features

| Variable | Contract |
| --- | --- |
| `OPENAI_API_KEY` | Optional. Concierge and other guarded AI paths use fallback behavior without it. |
| `OPENAI_MODEL` | Optional model override used by existing AI features. |
| `OPENAI_LAYOUT_MODEL` | Optional layout-AI model override. |

## Dashboard-Only Variables

`API_PORT`, `PORT`, `DASHBOARD_API_URL`, `DASHBOARD_WEB_URL`,
`DASHBOARD_SERVE_WEB`, `NEXT_PUBLIC_API_URL`, `SESSION_SECRET`,
`CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `SUPABASE_URL`,
and `SUPABASE_SERVICE_ROLE_KEY` are used by the Dashboard/API path, not the
main Bot startup path. `NODE_ENV` controls production cookie behavior.

## Unknown / Server-Audit Items

The repository cannot prove which of these variables exist on Vultr, whether
the dashboard is enabled, or whether current values remain valid. Copy and
protect the existing server `.env`; never replace it with repository defaults.
