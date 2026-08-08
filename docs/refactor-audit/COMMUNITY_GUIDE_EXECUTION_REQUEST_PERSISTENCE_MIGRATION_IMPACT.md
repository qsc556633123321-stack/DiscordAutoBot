# Guide Execution Request: Persistence Migration Impact

## Current Write Path

`setupCommunityGuide()` completes the selected legacy Discord edit/send branch,
then still calls `saveOnboarding(guild.id, patch)`. That call now follows:

```text
communityConcierge.saveOnboarding
  -> CommunityPublicationStateFeature
  -> PersistCommunityPublicationRecordUseCase
  -> communityPublicationRecordRepository
  -> CommunityPublicationStateFilesystemAdapter.mergeRecord
```

## Observed Effects

- Guide send still hands `message.id` to persistence after `channel.send()`.
- Guide edit still persists the existing edited message ID after `message.edit()`.
- Roadmap uses the same repository and retains the same shared root-record
  contract.
- `mergeRecord()` still reads the full root, shallow-merges the target guild,
  preserves unrelated guild/native/unknown fields during sequential writes, and
  writes the full root synchronously.
- Malformed-root fallback and swallowed write failure behavior are unchanged.

## Ownership Change

`communityConcierge` retains the runtime call point and legacy read path, but
does not own the writer implementation. Application owns persistence workflow;
Infrastructure owns filesystem merge/write behavior; Composition wires them.

## Consequence for Execution Request

Persistence is now a separate handoff after Discord execution. This removes one
reason to treat `GuidePublicationExecutionRequest` as a persistence wrapper,
but it does not give the Request the Discord resource references needed to
execute an edit or send.
