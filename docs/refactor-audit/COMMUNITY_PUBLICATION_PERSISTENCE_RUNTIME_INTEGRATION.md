# Community Publication Persistence Runtime Integration

## Scope

This slice moves only the `onboarding-flows.json` publication writer from
`communityConcierge` into the new architecture. Guide and Roadmap Discord
channel/message mutations, command metadata, reply behavior, and the existing
read path remain unchanged.

## Runtime Path

```text
saveOnboarding(guildId, patch)
  -> createCommunityPublicationStateFeature()
  -> PersistCommunityPublicationRecordUseCase.execute()
  -> CommunityPublicationStateFilesystemAdapter.mergeRecord()
  -> read whole onboarding root
  -> shallow-merge the guild record and updatedAt
  -> write whole onboarding root
```

## Compatibility Contract

- `src/data/onboarding-flows.json` keeps its existing format.
- Each write reads the current whole root, then shallow-merges only the target
  guild record. Guide, Roadmap, native onboarding, unknown fields, and other
  guilds survive sequential writes.
- Writes are synchronous, non-atomic, have no retry, lock, rollback, or
  idempotency token.
- Malformed, missing, or non-object roots still fall back to `{}`.
- Write failures are logged and swallowed. The returned record remains
  available and earlier Discord mutation side effects are not rolled back.

## Ownership After This Slice

| Concern | Owner |
| --- | --- |
| Input validation and persistence workflow | `src/application/community/persistCommunityPublicationRecordUseCase.js` |
| Persistence port | `src/application/community/ports/communityPublicationRecordRepository.js` |
| Filesystem read/merge/write behavior | `src/infrastructure/community/communityPublicationStateFilesystemAdapter.js` |
| Dependency wiring | `src/composition/communityPublicationStateFeature.js` |
| Existing runtime call point | `src/systems/communityConcierge.js` thin `saveOnboarding()` delegator |

## Regression Coverage

`test:community-publication-persistence-runtime-integration` covers direct
adapter sequential writes, existing-record merges, malformed-root recovery,
write failure, and missing-file initialization. Existing Guide/Roadmap runtime
characterization tests continue to validate the observable Discord-before-write
order and partial-success behavior.

## Rollback

Revert this slice's commit. The prior writer implementation was local to
`saveOnboarding()` in `src/systems/communityConcierge.js`; no production data
or deployment target is changed by this migration.
