# Community Publication Persistence Port Candidates

The prepared application-facing candidate is `CommunityPublicationStateStore`:

```text
load(guildId) -> CommunityPublicationState
applyPatch(guildId, operation) -> CommunityPublicationState
```

It accepts semantic state and operations, never raw legacy records. Candidate
operations are load, set/clear Guide, and set/clear Roadmap. No filesystem,
JSON, Discord, repository, or production adapter is introduced.

**Decision: No Production Persistence Port Approved.**
