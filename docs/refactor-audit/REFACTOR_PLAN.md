# Safe Refactor Plan

Generated: 2026-07-22

## Phase 0: Establish Baseline And Tests

Goal:
- Record install, build, architecture, permission, command, and complexity status before changing behavior.

Scope:
- Documentation and validation commands only.

Risk:
- Low. No runtime code changes.

Verification:
- `npm ci`
- `npm run quality:gate`
- `npm run dashboard:build`

Rollback:
- Revert audit docs and `.gitignore` changes.

## Phase 1: Clear Generated Files

Goal:
- Remove rebuildable generated output from local workspace and prevent it from entering archives or version control.

Scope:
- `.next*`, `dist`, `build`, `coverage`, logs, caches, temp files.

Risk:
- Low if limited to ignored generated output.

Verification:
- Confirm no source files are removed.
- Re-run relevant build commands after cleanup.

Rollback:
- Recreate generated output with `npm ci` and build/dev scripts.

## Phase 2: Confirm Entrypoints And Dependencies

Goal:
- Document runtime entrypoints and dependency flow.

Scope:
- `src/index.js`, `src/deploy-commands.js`, command registry, event loader, dashboard API/web entrypoints.

Risk:
- Low. Read-only analysis.

Verification:
- Dependency graph and command audit remain successful.

Rollback:
- Revert documentation only.

## Phase 3: Handle Legacy

Goal:
- Classify legacy modules by active use, fallback use, deprecated use, or removal candidate.

Scope:
- `src/legacy`, adapters, system wrappers, command aliases.

Risk:
- Medium to high. Legacy code is still dynamically loaded and fallback-driven.

Verification:
- `npm run analyze:dependencies`
- `npm run audit:commands`
- Runtime smoke tests for interactions and aliases before deleting anything.

Rollback:
- Restore moved/removed files from git.

## Phase 4: Consolidate Duplicate Modules

Goal:
- Replace duplicate layout, permission, game, panel, and storage logic with one service path each.

Scope:
- One subsystem at a time.
- Start with permission and game identity because they are high-impact and have tests.

Risk:
- High if done broadly.

Verification:
- Add or run targeted tests per subsystem.
- Check real Discord permission previews before execute paths.

Rollback:
- Revert the specific subsystem migration commit.

## Phase 5: Unify Commands, Events, And Interactions

Goal:
- Keep command/event files thin and route all behavior through modules/services.

Scope:
- Main command groups, aliases, interaction custom ID handlers, modal/select handlers.

Risk:
- Medium. Custom ID compatibility can break silently.

Verification:
- `npm run audit:commands`
- Manual button/modal/select smoke test on a staging Discord server.

Rollback:
- Re-enable legacy fallback adapters.

## Phase 6: Cleanup Completion And Documentation

Goal:
- Remove confirmed-unused legacy modules and update docs to match the final architecture.

Scope:
- Only files proven unused by static graph, runtime routing, and manual smoke tests.

Risk:
- Medium. Dynamic loading requires extra caution.

Verification:
- `npm run quality:gate`
- Dashboard build
- Discord bot dry-run/start check in a safe environment

Rollback:
- Restore deleted files from git and redeploy commands if needed.

