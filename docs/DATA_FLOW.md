# KU HUB Data Flow

## Current flow inventory

| Core feature | Input | Process | Output | Read source | Write source | Failure handling | Duplicate-source risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Community governance | Discord inventory, desired state, review decisions | classify, compare, compile immutable plan | preview, plan, receipt | Discord API, `src/data` JSON | governance JSON stores | stale fingerprint, protected-resource, rollback guards | Dashboard has no equivalent plan store |
| Game categories/roles | slash/select input, game registry | alias normalization, role/category policy | game identity and Discord operations | `gameRegistry`, JSON category data | JSON category data, Discord | service/result and legacy catch paths | aliases are canonical in Domain; legacy JSON remains separate |
| Panels | dashboard draft + Discord channel | draft upsert then publish | persisted draft/message ID | Supabase or in-memory fallback, Discord | `panel_drafts`, Discord message | API catches and returns safe JSON | Supabase draft differs from Bot panel JSON |
| Suggestions | modal/slash input | legacy validation/review | suggestion decision | legacy JSON | suggestion JSON | command-local handling | no shared Dashboard model |
| MemberGuard/security | event/message input | policy evaluation | moderation decision/log | JSON settings | JSON settings, Discord | service and event guards | settings split across legacy/current files |
| TempVoice | voice event | lifecycle/state cleanup | temporary room state | JSON, Discord | JSON, Discord | best-effort cleanup | Bot-only, no Dashboard source |

## Source-of-truth assessment

Bot and Dashboard do **not** currently share one authoritative community-data source. The Bot primarily owns operational state in `src/data/*.json`; the Dashboard owns sessions, panel drafts, and AI suggestions through Supabase with an in-memory fallback. It also queries Discord directly for current guild/channel/role views. This is intentional today but creates drift risk for any feature represented in both surfaces.

## Target flow

```text
Discord snapshot -> Normalize -> Compare desired rule version -> Cleanup plan
  -> Admin approval -> Execute with fresh-state check -> Verify -> Audit log
```

All persistent future community records are guild-scoped. Discord IDs remain text end-to-end; display names are descriptive attributes, never unique identity keys.

## Sprint 03 snapshot flow

`Discord Guild read` -> `DiscordGuildSnapshotAdapter` -> `CommunitySnapshot`
-> JSON snapshot repository -> reconciliation preview -> Dashboard API. The
preview compares that live snapshot, `channel_bindings`, and the existing desired
governance schema. It cannot modify Discord resources, permission overwrites, or
bindings. Snapshot JSON is an atomic local compatibility store, not a second
authoritative relational database.
