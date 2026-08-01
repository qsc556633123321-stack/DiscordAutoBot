# Community Welcome Delivery Result Contract

Prepared vocabulary only:

| Status | Meaning |
| --- | --- |
| `Delivered` | a future executor may report an accepted DM delivery. |
| `Skipped` | a future executor may report no deliverable destination. |
| `Failed` | a future executor may report a classified delivery failure. |

Reasons: `GuideDestinationUnavailable`, `DeliveryRejected`, and `Unknown`. The factory is immutable and side-effect free. The current legacy runtime exposes no result object: it returns `undefined` and swallows fetch/DM rejection. No raw Discord object, Error, stack, retry command, or metrics field is part of this contract.
