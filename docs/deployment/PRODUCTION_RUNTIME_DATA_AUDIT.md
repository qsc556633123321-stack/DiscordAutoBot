# Production Runtime Data Audit

## Data Location and Contract

The repository tracks initial JSON files under `src/data/`. Many active and
legacy runtime paths create, read, and write these files. They are mutable
community state, not disposable build cache.

`onboarding-flows.json` is particularly critical: it tracks Guide/Roadmap
publication and onboarding state. A missing file can be recreated with an
empty object, but doing so loses tracked IDs and can cause publication state to
be rebuilt or republished. It must be preserved from the server.

Other mutable state includes panel, role, member-guard, link-guard, game,
voice, suggestion, memory, layout, and activity JSON records in `src/data/`.
Committed empty/default files are bootstrap defaults only; live server content
must be treated as production state.

## Deployment Decision

- Data schema migration: **NONE** for this refactor slice.
- Data preservation migration: **REQUIRED** before replacement.
- Unsafe method: a release process that overwrites `src/data/` from Git.
- Required manual check: determine whether Vultr stores live data inside the
  checkout and whether it is excluded, copied, mounted, or backed up.

Do not deploy until a snapshot and restoration/preservation step for the live
data directory is written and verified on the server.
