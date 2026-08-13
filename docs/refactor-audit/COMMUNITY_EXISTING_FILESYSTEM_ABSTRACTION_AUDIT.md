# Existing Filesystem Abstraction Audit

| Existing component | Classification | Decision |
| --- | --- | --- |
| `src/infrastructure/community/communityPublicationStateFilesystemAdapter.js` | Partial | Shares onboarding path and some ensure/read behavior, but owns `mergeRecord`, `updatedAt`, and writes. Its fallback is fixed to `{}`. Do not reuse for a read boundary. |
| `src/infrastructure/storage/jsonStore.js` | Partial | Generic utility, but missing-file behavior returns a clone instead of creating the file and it suppresses errors without legacy logging. Do not reuse. |
| `CommunityOnboardingStateReader` | Reuse consumer | Keep as the state-shaping consumer; later replace only its injected read primitive. |

No approved read-only onboarding filesystem abstraction preserves the exact runtime contract. A narrow Infrastructure component is justified later.
