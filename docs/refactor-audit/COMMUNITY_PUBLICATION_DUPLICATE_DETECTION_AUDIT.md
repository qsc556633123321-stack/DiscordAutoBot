# Community Publication Duplicate Detection Audit

| Mechanism | Guide/Roadmap status | Evidence |
| --- | --- | --- |
| persisted message ID fetch | Present | only current lookup |
| channel ID validation | Not Present | saved channel ID unused in setup |
| embed/footer/content/component marker | Not Present | no semantic verification |
| author/pin/timestamp/type/topic checks | Not Present | no matching logic |
| history scan | Not Present | missing record sends |
| deterministic key / idempotency token | Not Present | retry duplicate risk |
| external record | Partial | JSON may be stale/lost |

No duplicate detector is implemented.
