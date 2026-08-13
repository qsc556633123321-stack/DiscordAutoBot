# Community Welcome Channel Resolver Runtime Redirect Result

## Completed Ownership Move
- Welcome channel tracking: Migrated.
- Welcome channel resolver: Runtime active.
- Welcome channel resolution: Migrated.
- Direct Welcome cache, fetch, and direct name invocation: Removed.

`sendConciergeWelcome` now creates one resolver per invocation after the single tracking read, then calls `resolve` once with the exact tracked ID and `GUIDE_CHANNEL_NAME`.

## Preserved Contracts
Cache/fetch/fallback object identity, raw truthy malformed IDs, falsy fallback, swallowed fetch rejection, no-channel early return, semantic request mapping, payload construction, direct DM delivery, and swallowed DM failure all remain equivalent.

## Remaining Runtime Ownership
DM delivery remains `member.send(payload).catch(() => null)`. Welcome is therefore **NOT CLOSED**.
