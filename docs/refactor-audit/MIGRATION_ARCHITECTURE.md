# Legacy Migration Architecture

## Target Flow

```text
Legacy command wrapper
  -> Presentation adapter
  -> Application use case
  -> Domain policy
  -> Infrastructure gateway/repository
  -> Discord API, storage, or retained legacy implementation
```

The legacy wrapper remains deployed until a release-window review confirms the new path. It owns no business workflow; it only re-exports the presentation command contract.

## Layer Responsibilities

| Layer | Responsibility | Legacy migration destination |
| --- | --- | --- |
| Application | Use cases, workflow ordering, transaction boundaries, orchestration | Move command `execute()` workflow here after preserving its public input/output contract. |
| Domain | Business rules, entities, value objects, policy decisions | Move pure decisions here; no Discord.js, filesystem, or environment access. |
| Infrastructure | Discord API, JSON store, Supabase, filesystem, compatibility gateways | Isolate Discord/storage calls here. A retained legacy implementation may sit behind a named gateway temporarily. |
| Presentation | Slash command, interaction, event adapters, Embed/reply composition | Keep Discord interaction acknowledgement and response shape here. |

## Placement Rules

- A legacy command becomes a thin wrapper around a presentation adapter; its `data` and command name remain unchanged.
- A legacy system with workflow logic moves into an application use case, one behavior slice at a time.
- Pure permission, naming, validation, and visibility decisions move to domain policies.
- Direct legacy Discord or storage calls become infrastructure gateways before their underlying implementation is replaced.
- A migration is not complete merely because a new file exists: the active wrapper must call the new path and regression tests must prove the response contract.

## Rollback Boundary

Every migration keeps the legacy file. Rollback is a single import/execute reversion in that wrapper. Do not delete the underlying legacy runtime in the same change.
