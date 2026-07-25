# Community Guide Mutation Readiness Decision

## Decision Table

| Candidate | Runtime certainty | Baseline | Coupling / risk | Status |
| --- | --- | --- | --- | --- |
| Guide Existing-Message Refresh | active | covered edit/fetch, partial parent/category prerequisites | shared ensure and record write | Needs more baseline |
| Guide New-Message Publish | active | covered send/fetch/write failure | send-before-write duplicate risk | Needs more baseline |
| Guide Message Record Persistence | active | covered missing/malformed/write failure | same record owns Roadmap and native task fields | Blocked |
| Guide Channel Ensure | active | category/channel/overwrite covered; some failures partial | layout/permission direct writes | Needs more baseline |
| Guide Permission Ensure | active | swallowed overwrite failure covered | full overwrite replacement, Guest Gate coupling | Blocked |
| Roadmap Existing-Message Refresh | active via direct command workflow | happy path only | shared record/command response | Needs more baseline |
| Roadmap New-Message Publish | active via direct command workflow | happy path and second write failure | untracked-message risk | Needs more baseline |

## First Production Mutation Slice

**No Mutation Slice Approved.**

The tests characterize current behavior but do not make any part sufficiently
isolated: all candidates still rely on direct channel ensure, direct Discord
writes, a shared legacy JSON record and command-level Guide/Roadmap ordering.

## Explicit Blockers

1. No explicit transaction/recovery contract across Guide and Roadmap.
2. The shared Guide/Roadmap record does not define atomic recovery, even though
   the category-create, parent-move, Roadmap edit, and Roadmap send failures
   are now characterized.
3. Full permission overwrite replacement is inseparable from channel ensure.
4. JSON persistence is synchronous, non-atomic and shared with native task data.
5. Indirect bootstrap/V3 callers have different best-effort error handling.

## Status

Community Guide Mutation Baseline: **Complete**.

Community migration: **Migration In Progress**.

Guide Status: **Dead / No Consumer / Not Migrated**.

## Shared Persistence Contract Update (2026-07-25)

The Guide/Roadmap shared persistence contract is now frozen separately. This
does not migrate persistence, Guide mutation, Roadmap mutation, a repository,
or a port. The first mutation slice remains unapproved.

The Publication Identity Contract further confirms that no identity resolver,
duplicate detector, or recovery mutation may be extracted yet.

## Persistence Boundary Preparation Update (2026-07-26)

An unused semantic persistence boundary and test-only in-memory store now
exist. This does not approve a Guide mutation, filesystem adapter, repository,
or runtime wiring; the first mutation slice remains unapproved.
