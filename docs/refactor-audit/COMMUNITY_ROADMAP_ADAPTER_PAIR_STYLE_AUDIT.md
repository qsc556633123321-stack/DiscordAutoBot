# Community Roadmap Adapter Pair Style Audit

`GuidePublicationAdapterPairFactory` is the local style reference, but the
Roadmap pair candidate deliberately has a narrower responsibility.

| Concern | Roadmap candidate decision |
| --- | --- |
| Name | `RoadmapPublicationAdapterPair` |
| Factory input | `{ ensuredChannel }` only |
| Session ownership | one new per-pair Resource Session |
| Adapter ownership | one Lookup Adapter built from that same Session |
| Public keys | `lookupPort`, `getRetainedMessage` |
| Retained-message handoff | synchronous, exact identity, read-only, zero I/O |
| Private details | session, channel, and mutation capability |
| Lifecycle | per invocation; no cache or singleton |
| I/O at construction | none |
| Guide dependency | none |

Unlike the Guide pair, the Roadmap candidate has no mutation port or mutation
failure accessor because those responsibilities remain legacy-owned.
