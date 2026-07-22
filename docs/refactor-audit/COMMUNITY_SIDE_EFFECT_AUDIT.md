# Community Side Effect Audit

| Effect | Known sources / call order | Failure, retry, rollback, logging | Idempotency / gateway fit / risk |
| --- | --- | --- | --- |
| Category/channel create and edit | legacy `communityBootstrapSystem`, `communityV3BuilderRuntime`, `serverRebuilder`, `communityConcierge` -> `guild.channels.create`, `setParent`, `setName`, reorder helpers. | Most legacy paths use local try/catch and summaries; no transaction spans a full rebuild. Rollback is manual/re-run/legacy source. Logs vary by command. | Partly idempotent name matching; high risk. Strong candidate for a Discord channel gateway. |
| Channel delete / archive-like cleanup | layout/cleanup/rebuilder paths, not a first Community slice. | Confirmation and protection rules differ; partial failures leave state. | Very high data-loss risk. Explicitly deferred. |
| Permission overwrite set/edit | legacy `guestGate`, `rolePermissions`, templates; active `discordPermissionWriter`. | Writer returns Result; legacy plans may continue after failures. Existing plan previews/confirmation are user-visible. | High risk; belongs behind a permission application gateway. |
| Role create/edit/add/remove | `roleManagerRuntime`, V3 builder, Concierge quick role. | Discord hierarchy/permission failures are caught variably. No general rollback for added/removed roles. | Very high user-visible and security risk. |
| Message send/edit/delete | Concierge guide/roadmap, channel panels, announcements, welcome. | Existing fetch/edit fallbacks may create a new message; DM failures are swallowed. | Medium-high; message gateway fits. |
| JSON read/write | `onboarding-flows.json`, `community-roadmap.json`, layout/game/panel/role/welcome plans and metadata. | Several legacy modules use direct `fs` with local fallback. Atomicity and schema validation are inconsistent. | Medium; repository extraction needs fixtures before moving behavior. |
| Cache mutation | Guild channel/role cache is read throughout plans; no application cache contract. | Cache may be stale; some code fetches individually. | Medium; adapters should own Discord cache/fetch behavior. |
| Scheduler/event registration | `src/index.js` dynamic event loading; welcome/Voice paths register behavior through event modules. | Failure is startup/runtime-wide. | High; do not move in first Community slice. |
| Webhook/DB | No confirmed Community-owned webhook or Supabase write path found. | n/a | Do not invent an adapter. |

## High-risk mutation sequence

`/rebuild-community-v3` / bootstrap / architect can create roles/categories/channels, move/rename them, apply overwrites, write plans, set up panels, and send logs. These steps are not transactional and must be migrated last with operation-level regression fixtures and partial-failure reports.
