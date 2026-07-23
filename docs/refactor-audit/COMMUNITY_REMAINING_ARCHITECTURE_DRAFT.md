# Community Remaining Architecture Draft

## Read architecture

```text
Presentation command/button adapter
  -> focused query use case
  -> pure domain model / renderer
  -> read port
  -> Discord Guild Read Port, Channel Query Port, or JSON repository
```

Examples: Help-me-start recommendation, Guide content, Guide status, available roles, panel payload. Read paths must never call `ensure`, `getOrCreate`, message publication, role add/remove, or JSON write.

## Mutation architecture

```text
Presentation adapter
  -> focused mutation use case
  -> domain policy / validated request
  -> one or more narrow ports
  -> Discord role/channel/message/permission writer, JSON repository, logger
```

Required ports are intentionally narrow:

- **Discord Guild Read Port**: guild/member/channel/role facts only.
- **Channel Query Port**: find/fetch channel/message facts only.
- **Role Mutation Port**: create/add/remove/edit role operations, hierarchy result.
- **Message Publication Port**: fetch/send/edit/delete only recorded messages.
- **Permission Mutation Port**: write/sync overwrite operations only.
- **Onboarding Repository**: read/write Guide/Roadmap IDs and onboarding metadata.
- **Role Settings Repository**: read/write `role-settings` contract.
- **Panel Record Repository**: read/write panel message records.
- **Proposal Repository**: read/write suggestion and game-category contracts.
- **Optional AI Text Port**: optional prose request with deterministic fallback supplied by application/domain.
- **Logger Port**: best-effort audit record, never alters primary success result.

## Orchestration architecture

```text
Admin command / confirmation adapter
  -> plan use case (read-only)
  -> stored plan repository
  -> confirmation ownership guard
  -> execute use case
  -> narrow mutation ports
  -> explicit partial-failure summary
```

Bootstrap, rebuild, Architect, proposal approval, and Guest cleanup need this form. They must not be combined into a broad Community mutation use case.

## Explicit non-designs

Do not introduce `CommunityFacade`, a giant `DiscordGateway`, a giant `CommunityRepository`, a generic `MutationUseCase`, or a universal `PanelService`. These would recreate the existing mixed ownership rather than expose bounded contracts.
