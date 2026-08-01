# Community Welcome Message Builder Runtime Rollback Plan

- Base: `a6c2e30`.
- Integration changes only `src/systems/communityConcierge.js`: an Application barrel import and replacement of the inline DM payload with mapper/builder calls.
- Roll back with `git revert <integration-commit>` after stopping no service and performing no data repair.
- Verify with the runtime integration, differential, lookup non-regression, and call-count tests.
- No JSON migration, Discord repair, persistence repair, state conversion, or channel repair is needed because delivery API, lookup, persistence, and data shape are unchanged.
