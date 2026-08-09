# Guide vs Roadmap Mutation Port Matrix

| Concern | Guide | Roadmap decision |
| --- | --- | --- |
| Operations | Separate Edit/Send | Separate Edit/Send |
| Requests | Scalar IDs plus opaque payload | `edit({ messageId, payload })`, `send({ payload })` |
| Success | Operation discriminator plus message ID | Same discriminator shape |
| Failure | Adapter/session handoff | Separate Roadmap handoff required |
| Edit identity | Retained original message | Retained original `M` |
| Send identity | Retained send result | Retained exact `S` |
| Persistence | Separate | Separate, legacy-owned |

Decision: separate Roadmap Port; do not reuse or widen the Guide Port.
