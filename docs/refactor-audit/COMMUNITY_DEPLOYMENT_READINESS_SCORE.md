# Community Deployment Readiness Score

## Status: BLOCKED

The refactored GitHub candidate passes local architecture and regression gates,
but it is not yet authorized to replace the Vultr legacy release.

## Local Evidence

- Architecture Score: 100/100; circular and reverse dependencies: 0.
- Community Guide, Roadmap, Welcome, channel setup, role/non-role presentation,
  prefix dispatch, filesystem ownership, and Concierge AI transport are closed
  or migrated.
- Lockfile installation, offline startup smoke, dashboard build, and required
  local test gates pass.

## Blocking Manual Evidence

1. The active Vultr service manager, release path, Node version, and startup
   command are unknown.
2. The location and preservation method for live mutable `src/data/` state are
   unknown. Replacing it with repository defaults risks data loss.
3. Live environment-variable presence, Discord privileged intents, Bot role
   permissions/position, and Dashboard/Supabase enablement are unverified.
4. Existing npm dependency advisories require operational triage before a
   public Dashboard deployment.

## Decision

Run a read-only manual Vultr Server Audit next. No further structural Community
refactor is justified by this readiness assessment.
