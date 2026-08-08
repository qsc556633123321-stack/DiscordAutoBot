# Message Identity Handoff Ownership

| Layer | Owns |
| --- | --- |
| Runtime | legacy local Message variable, legacy edit receiver, plan/persistence ordering |
| Application | pure ID and availability contracts only; raw Discord Message forbidden |
| Infrastructure Session | exact fetched Message, retention, fetch capability |
| Lookup Adapter | availability signal only |
| Mutation Adapter | future edit/send capability only; not used by this slice |
| Composition | per-invocation Pair construction only |

Any handoff is an Infrastructure-to-Runtime migration seam, never an Application contract.
