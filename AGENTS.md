# DiscordAutoBot Codex Working Rules

## Project Goal

Refactor DiscordAutoBot from the legacy architecture into a clean, maintainable layered architecture without breaking existing production behavior.

The Vultr production environment is still running the pre-refactor legacy version.

Do NOT deploy to Vultr unless explicitly instructed by the user.

---

## Source of Truth

After every approved refactor slice, Codex must update:

`docs/REFACTOR_STATUS.md`

This file is the current project handoff and progress source of truth.

It must accurately reflect the actual repository state.

Do not report work as completed unless the corresponding production code or approved tests actually exist.

---

## Required Workflow After Every Approved Refactor Slice

After completing a slice:

1. Run all relevant tests.
2. Run migration tests.
3. Run architecture checks.
4. Run legacy audit checks.
5. Run quality gate checks.
6. Confirm there are no unexpected circular dependencies.
7. Confirm there are no reverse layer dependencies.
8. Update `docs/REFACTOR_STATUS.md`.
9. Review `git diff`.
10. Commit the approved changes.
11. Push the commit to the current GitHub branch.

If any required check fails:
- Do not mark the slice complete.
- Do not claim the project is ready for deployment.
- Document the failure or blocker in `docs/REFACTOR_STATUS.md`.
- Fix the issue before continuing unless explicitly told otherwise.

---

## REFACTOR_STATUS.md Required Fields

After every completed slice, update at minimum:

### Current Phase
What refactor phase is currently active.

### Overall Progress
Estimated local refactor progress.

Do not increase progress merely because documentation or characterization was added.

Progress should increase when meaningful risk, legacy ownership, runtime behavior, or migration scope has actually been completed.

### Latest Completed
List only work that is actually complete.

### Architecture Health
Keep current values for:
- Architecture Score
- Circular Dependencies
- Reverse Layer Dependencies

### Current Ownership
Clearly identify which responsibilities are owned by:
- New Architecture
- Legacy

### Deployment Status
Always specify:
- Local refactor state
- GitHub state
- Vultr production state

Unless explicitly changed by the user, Vultr production must be treated as:
`Pre-refactor legacy version`

### Deployment Readiness
State whether the current repository is safe to replace the production Vultr version.

Do not declare production readiness only from a percentage.

Deployment readiness must depend on completed runtime boundaries, persistence safety, passing tests, and rollback capability.

### Next Recommended Slice
Give one concrete next refactor slice.

Avoid vague recommendations.

### Required Checks
Record relevant pass/fail results.

### Blockers
Document any unresolved architecture, runtime, persistence, testing, data, or deployment blockers.

### Last Updated
Update this section every time the file changes.

Include:
- date/time if available
- latest commit SHA after commit if practical

---

## Architecture Rules

Maintain the intended dependency direction:

Presentation
→ Application
→ Domain

Infrastructure may implement ports required by Application or Domain.

Composition wires concrete implementations together.

Do not introduce reverse dependencies.

Do not allow Domain to depend on Discord.js, filesystem, database clients, presentation code, or infrastructure implementations.

Do not move business rules into adapters merely to make migration easier.

---

## Legacy Migration Rules

Legacy code may remain temporarily when required for safe incremental migration.

Prefer:

Legacy Wrapper
→ New Application / Domain

over duplicating behavior.

Do not create a second permanent implementation of the same business rule.

For every migration slice:
- identify existing legacy ownership
- preserve current behavior unless the slice explicitly changes behavior
- add or preserve regression coverage
- reduce legacy responsibility where safely possible

Delete legacy code only when:
- no production caller depends on it
- replacement behavior is covered
- architecture checks pass
- regression tests pass

---

## Mutation Safety Rules

Discord mutation flows are high-risk.

This includes:
- channel creation/deletion/update
- message creation/edit/delete
- role creation/update/delete
- permission overwrites
- member role mutation
- onboarding configuration
- proposal approval side effects
- voice lifecycle
- layout rebuild
- persistence writes associated with Discord mutations

Before replacing a mutation runtime path:
- characterize current behavior
- identify retries and partial-failure behavior
- identify persistence ordering
- preserve idempotency where it already exists
- avoid creating duplicate Discord resources
- add regression coverage

Do not perform broad rewrites of multiple mutation systems in one slice unless explicitly approved.

---

## Persistence Safety Rules

Treat persistence changes as high-risk.

Before replacing a persistence path:
- confirm existing file/schema format
- preserve compatibility with current stored data
- preserve unrelated fields
- test sequential writes
- test failure behavior
- consider stale-read/concurrent-write behavior
- avoid silent destructive migrations

Do not change production data format without explicit migration logic and tests.

---

## Production / Vultr Rules

Never automatically deploy to Vultr.

Never:
- SSH into production
- restart the production bot
- change production environment variables
- modify production secrets
- delete production files
- migrate production data
- switch production branches

unless explicitly instructed by the user.

GitHub push is allowed as part of the normal approved development workflow.

Vultr deployment is a separate explicit milestone.

---

## Secrets

Never commit:
- `.env`
- Discord bot tokens
- API keys
- database passwords
- Supabase secrets
- private keys
- production credentials

Before committing suspicious configuration changes, verify secrets are not tracked.

---

## Git Rules

Before commit:
- inspect `git status`
- inspect relevant `git diff`
- ensure generated junk and secrets are excluded

Use meaningful commit messages.

Examples:

`refactor: integrate guide publication runtime plan`

`refactor: migrate guide persistence writer`

`test: freeze guide mutation failure behavior`

`chore: update refactor status`

Push only after relevant checks pass.

---

## User Handoff Rule

The user should not need to manually copy Codex reports into ChatGPT.

The repository itself should contain enough current information for another AI or developer to understand:
- what has been completed
- what remains legacy-owned
- current test/architecture status
- current deployment state
- next recommended slice

Keep `docs/REFACTOR_STATUS.md` concise, accurate, and current.

---

## Priority

Safety and architectural correctness are more important than migration speed.

However, avoid unnecessary analysis-only work when the runtime boundary is already sufficiently characterized and safely ready for migration.

Prefer small, complete vertical slices that measurably reduce legacy ownership.