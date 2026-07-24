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

- Application reads Guide content through its content port and accepts the active guild name as input.
- Domain returns plain data only and imports no Discord, filesystem, legacy, or infrastructure module.
- Infrastructure contains the static content reader only.
- Presentation is the only layer that imports Discord Embed and component builders.
- The legacy Concierge text generator is injected as a narrow text-generation port by the compatibility consumer. This preserves existing optional AI/fallback wording without making the new read composition import the legacy system.

## Excluded status and channel facts

No active or indirect runtime consumer used Guide status or channel inventory. The speculative status query, onboarding-flow JSON reader, and Guild facts reader were removed. The active Guide payload depends only on static content, `guildName`, and the existing Concierge intro generator.
