# Community Guide Mutation Contract

## Contract Scope

This freezes the observable current behavior of `setupCommunityGuide` and
`setupRoadmapPanel`. It is a characterization contract, not a redesigned API.

## Inputs and Outputs

| Function | Input | Success output | Failure output |
| --- | --- | --- | --- |
| `setupCommunityGuide` | `guild`, optional `{ mode }` | `{ channel, message }` | rejects on channel ensure, payload, message edit or message send failure |
| `setupRoadmapPanel` | `guild` | `{ channel, message }` | rejects on channel ensure, embed build, message edit or send failure |
| `saveOnboarding` | guild ID and patch | merged per-guild record | logs/catches JSON write failure; caller continues |

## Frozen Message Lifecycle

| Condition | Required calls | Forbidden inference |
| --- | --- | --- |
| Stored message fetch succeeds | one fetch, one edit, no send | do not delete/recreate message |
| Stored message missing/fetch rejects | one fetch, no edit, one send | do not assume the old message was deleted |
| No stored message ID | no fetch, one send | do not create a synthetic ID before send |
| Edit rejects | reject before record write | do not fall back to send |
| Send rejects | reject before record write | do not write a message ID |
| JSON write rejects | retain successful Discord message result | do not turn it into function rejection |

## Frozen Channel Lifecycle

| Condition | Required behavior |
| --- | --- |
| Guide category missing | create category first. |
| Guide channel missing | create text channel with entry-category parent and onboarding-visible overwrites. |
| Guide channel parent differs | call `setParent(..., { lockPermissions: false, reason })`. |
| Guide channel exists | always call `permissionOverwrites.set(...)`; ignored overwrite failure must not block publication. |
| Roadmap channel missing | create it under ensured roadmap category; no Guide overwrite coupling is inferred for it. |

## Coupling Contract

- `/setup-community-guide` and `/refresh-community-guide` defer ephemerally,
  validate `ManageChannels`, execute Guide then Roadmap, then call `editReply`.
- Bootstrap/V3 indirect callers reuse the same functions; this does not grant
  a separate transaction or retry behavior.
- The per-guild `onboarding-flows.json` record owns both Guide and Roadmap IDs.
- Native onboarding recommendations are persisted with Guide publication.

## Non-goals

This contract does not bless direct file I/O, direct Discord calls, current
encoding, message text, native Discord onboarding configuration, role buttons or
new retry behavior. Those are migration constraints, not scope for this baseline.
