# Community Guide Read Runtime Audit

## Active compatibility path

`setupCommunityGuide()` in `src/systems/communityConcierge.js` remains the active mutation workflow. It now delegates only its pure Guide payload construction to `buildGuidePayload()`:

```text
setupCommunityGuide
  -> buildGuidePayload (compatibility consumer)
  -> Community Guide read composition
  -> query, domain view model, readers, renderer
  -> existing channel/message/status mutation workflow
```

The existing workflow still owns channel lookup/creation, message fetch/edit/send, and onboarding-flow persistence. Those mutations were not migrated.

## Dependency boundaries

- Application reads through Guide content, status, and guild-facts ports.
- Domain returns plain data only and imports no Discord, filesystem, legacy, or infrastructure module.
- Infrastructure contains the static content reader, read-only onboarding-flow JSON reader, and Discord guild-facts reader.
- Presentation is the only layer that imports Discord Embed and component builders.
- The legacy Concierge text generator is injected as a narrow text-generation port by the compatibility consumer. This preserves existing optional AI/fallback wording without making the new read composition import the legacy system.

## Status query

`getCommunityGuideStatus` is a read-only capability over the existing onboarding-flow record. It has no new command, write path, or migrated publish consumer in this slice.
