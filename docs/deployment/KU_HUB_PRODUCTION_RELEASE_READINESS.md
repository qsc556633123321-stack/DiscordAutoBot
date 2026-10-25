# KU HUB Production Release Readiness

Last assessed: 2026-10-25 (repository evidence only)

## Decision

**NO-GO for a Vultr production deployment today.**

The repository is locally testable and the Sprint 01–05 community preview and
governance-history work is read-side only. It is not yet safe to publish the
Dashboard/API on the existing Bot host because its API process creates its own
Discord Gateway client through `apps/api/discord.js`. Starting it with the
same Bot token as the PM2 Bot could create a second production Bot connection.

The approved near-term outcome is a **GO for an isolated, read-only staging
validation** after the manual gates in the runbook are completed. It is not a
production cutover approval.

## Repository versus known deployed release

The latest repository main contains Sprint 01–05 after the recorded deployed
Bot release `b484f77565d29db76ba867c7c6de61d23708987b`. The historical Bot-only
deployment record is in `VULTR_REFACTORED_DEPLOYMENT_READINESS.md`; this review
does not reconnect to Vultr and therefore cannot prove that release, PM2 state,
or live data still matches the record.

Changes since that release include Server Governance v1, game-role work, and
the KU HUB data architecture: JSON-first repository contracts, snapshot
persistence, reconciliation, Supabase read-shadow preparation, and
OAuth-authorized read-side Dashboard endpoints. No Supabase migration was run
by these changes.

## Evidence and limits

| Area | Repository evidence | Release conclusion |
| --- | --- | --- |
| Bot startup | `npm start` runs `src/index.js` and logs in one Discord client. | Existing Bot deployment method remains separate from Dashboard. |
| Dashboard startup | `npm run dashboard:start` runs `apps/api/start-production.js`, which serves the API and Next build. | Not approved on the current Bot host. |
| Second Bot risk | `apps/api/discord.js` constructs a `discord.js` Client and `ensureBot()` calls `login(DISCORD_TOKEN)`. | Blocking issue for using the same token beside the PM2 Bot. |
| Read-only preview | Community preview and governance history are OAuth session- and Guild-management-gated. | Suitable for isolated staging only. |
| Dashboard writes | Mutating panel/announcement routes are denied unless `DASHBOARD_WRITE_ENABLED=true`; they also require Guild management. | First release must leave the flag absent. |
| Session secret | Production Dashboard API now refuses the development fallback secret. | Administrator must provide a strong `SESSION_SECRET` outside Git. |
| Supabase | Read adapters return `DATABASE_NOT_READY` when the schema/client is unavailable. JSON stays primary. | Safe display state; no automatic database fallback or migration. |
| Production environment | No Vultr connection or server command was used in this review. | All live findings remain manual verification items. |

## Data, retention, and backups

The active compatibility source remains JSON. Preserve, checksum, and restore
as a group: `src/data`, `src/legacy/data`, governance review decisions,
approved plans, execution transactions, snapshot records, and the production
environment file. The existing backup plan is
`VULTR_PRODUCTION_BACKUP_PLAN.md`; its output is secret-bearing and must not be
copied to GitHub or chat.

Snapshot and reconciliation previews are read-only. Governance decisions,
plans, and audit records remain JSON-backed. Supabase is an optional read
shadow only; missing schema must display `DATABASE_NOT_READY`, never a false
"consistent" result.

## Security findings

1. Do not place the Dashboard API beside the existing Bot with the same
   `DISCORD_TOKEN`: it would start another Gateway client.
2. Keep `DASHBOARD_WRITE_ENABLED` unset for the first read-only release.
3. Require a strong, unique `SESSION_SECRET` in production; it must not be the
   development fallback and must never be logged.
4. Configure Discord OAuth with an exact HTTPS redirect URI and validate the
   registered callback manually. The existing cookie is signed, HTTP-only,
   `SameSite=Lax`, and marked secure in production.
5. Manually verify that the reverse proxy terminates HTTPS and that
   `DASHBOARD_WEB_URL` is the exact allowed CORS origin.
6. Do not expose the Supabase service-role key to the browser or client-side
   runtime. The repository does not print it.

## Required manual confirmations before any production action

- The actual PM2 Bot process, release path, Node version, and one-and-only-one
  active Discord Bot process.
- A tested backup of live JSON state and `.env`, with readable checksums and a
  documented restore location.
- The production deployment SHA and working tree state, checked read-only.
- Discord OAuth application callback, HTTPS proxy, cookie domain, and allowed
  Dashboard web origin.
- An isolated Dashboard/API design that does not log in a second Bot client.
- JSON-first operation and visible `DATABASE_NOT_READY` output while Supabase
  remains unapplied.
- Governance execution remains disabled and no Execute control is exposed.

See `KU_HUB_READ_ONLY_ROLLOUT_RUNBOOK.md` for the gated test deployment,
production procedure, smoke test, and rollback plan.
