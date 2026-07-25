# Community Guide/Roadmap Persistence Behavior Contract

## Exact legacy behavior

1. The path is `src/data/onboarding-flows.json`; encoding is `utf8`.
2. `ensureFile()` synchronously creates a missing file with `{}` before read/write.
3. Read is synchronous. `JSON.parse(readFileSync(...) || '{}')` occurs on each
   `readOnboardingData()` call.
4. Empty, malformed, array, null, or other invalid root returns fallback `{}`;
   parse errors are logged. Missing guild also reads as `{}`.
5. `saveOnboarding()` reads again, applies a one-level object spread merge at
   `data[guildId]`, then sets `updatedAt` last.
6. Sibling fields in the target guild and other guilds survive that merge unless
   the patch names the same field. Arrays are replaced, not merged. `undefined`
   follows JavaScript object/JSON serialization behavior; null is preserved.
7. Write is synchronous full-file `JSON.stringify(data, null, 2) + '\n'`.
   There is no temp file, atomic rename, lock, transaction, or compensation.
8. Write errors are logged and swallowed. Discord send/edit completes before the
   save call, so a write failure leaves a live but untracked message.
9. Guide and Roadmap each perform their own read/write. Setup/refresh commands
   call Guide first then Roadmap; Guide failure prevents Roadmap invocation.
10. Interaction success reply follows both operations in the command. There is
    no explicit retry loop. A later retry with no persisted message ID sends
    another message, creating duplicate-publication risk.

## Not observed

No production behavior exists for deep merge, array merge, trailing-content
recovery, conflict detection, concurrent writer protection, rollback, or
compensation. These are explicit migration blockers, not implied requirements.
