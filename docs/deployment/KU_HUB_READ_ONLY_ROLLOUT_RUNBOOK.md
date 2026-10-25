# KU HUB Read-Only Rollout Runbook

## Scope and stop rule

This runbook releases only read-side KU HUB previews. It must not deploy a
second Discord Gateway Bot, execute governance plans, run Supabase migrations,
or alter Discord resources. Stop immediately on any failed gate and use the
rollback section; do not improvise fixes on the host.

## Phase 0: Administrator preflight

1. Confirm the current production Bot is the recorded Bot-only release using
   the read-only audit commands in `VULTR_MANUAL_READ_ONLY_AUDIT_COMMANDS.md`.
2. Confirm exactly one process holds the production Bot token and connects to
   Discord Gateway.
3. Take the protected backup described in `VULTR_PRODUCTION_BACKUP_PLAN.md`.
   Validate its completion without sharing `.env` or secret-bearing contents.
4. Record the live release SHA, Node/npm versions, PM2 application name, data
   paths, and a rollback owner in the deployment ticket.
5. Confirm `SERVER_GOVERNANCE_EXECUTION_ENABLED` remains disabled and
   `DASHBOARD_WRITE_ENABLED` is absent.

**Gate:** all five confirmations are recorded by an administrator. Otherwise,
do not proceed.

## Phase 1: Isolated test deployment

1. Create a separate test host or isolated service using a separate Discord
   test application/token and a test Guild. Do not reuse the production Bot
   token.
2. Install the exact approved main commit and the committed lockfile.
3. Provide secrets only through the host secret store: a strong
   `SESSION_SECRET`, OAuth client credentials, and exact test HTTPS callback.
4. Keep Supabase migration unapplied. Verify the Dashboard reports
   `DATABASE_NOT_READY` rather than failing or pretending the database is
   ready.
5. Keep `DASHBOARD_WRITE_ENABLED` unset. Verify panel publishing and
   announcements are denied.

**Gate:** all read-only smoke checks pass with no Discord write activity.

## Phase 2: Read-only smoke checks

Perform with an OAuth user who has Guild management permission and a second
user who does not:

1. Login completes only through the configured HTTPS callback.
2. The authorized user can view the community preview and governance history
   for a manageable Guild.
3. The unauthorized user receives `guild_management_required` for those
   Guild-scoped read endpoints.
4. Snapshot time/version, reconciliation issues, and database readiness are
   visible; unavailable Supabase reports `DATABASE_NOT_READY`.
5. Repeat the preview twice. Confirm no channel, role, permission, message, or
   JSON state changes occur.
6. Confirm write routes return `dashboard_read_only` and no Governance Execute
   action is available.
7. Confirm server logs contain no token, OAuth access token, refresh token, or
   Supabase credential.

## Phase 3: Production release decision

Production may proceed only after the Dashboard API has an approved design
that does **not** create a second Gateway client using the production token.
Until then, production remains Bot-only and this phase is blocked.

When that design is available, an administrator must repeat Phase 0, deploy a
versioned release beside the running Bot, preserve live state, and perform the
same smoke checks. Do not run slash-command deployment, Supabase migration, or
Governance execution as part of this release.

## Rollback

1. Stop accepting Dashboard traffic at the proxy or service level; do not
   restart the Bot as an exploratory fix.
2. Return traffic to the prior known-good read-only release, or disable the
   Dashboard service if no safe prior Dashboard release exists.
3. Preserve current logs and copy only non-secret diagnostics into the incident
   record.
4. Do not restore JSON automatically. Restore only after an administrator has
   compared checksums and confirmed a data-write incident.
5. Keep the Bot process, governance execution flag, and Discord configuration
   unchanged unless a separately approved incident procedure directs otherwise.

## Manual approval record

The deployment ticket must name the approver, release SHA, backup location,
test result, OAuth callback, data-source mode, and explicit confirmation that
there is no second production Bot connection.
