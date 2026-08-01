# Legacy-to-Result Mapping Analysis

| Legacy evidence | Proposed status / reason | Information loss | Safe to integrate now |
| --- | --- | --- | --- |
| `member.send` resolves | Delivered / none | resolved value discarded | No; outward value is legacy `undefined` |
| `member.send` rejects inside `.catch(() => null)` | Ambiguous / DeliveryRejected | caller cannot distinguish from Delivered | No |
| missing/fetch-null/fetch-rejected destination | Skipped / GuideDestinationUnavailable | fetch error is swallowed | No |
| pre-send synchronous throw | no stable Result mapping | event owns catch/log behavior | No |
| unknown rejection | Ambiguous / Unknown | error is discarded | No |

`Failed` cannot be truthfully emitted by the current function without changing its catch/return behavior. Any Result computation must remain future internal-only and must preserve the legacy outward `undefined`/rejection contract.
