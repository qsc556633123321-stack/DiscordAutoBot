# Community Welcome Delivery Result State Matrix

| Branches | Observable classification | Candidate result / reason | Confidence | Blocker |
| --- | --- | --- | --- | --- |
| WR-B01, B06, B08, B12, B21, B22, B30 | DM attempted; function resolves `undefined` | Delivered / none | High | Return does not expose delivery proof |
| WR-B02, B07, B20, B28 | DM attempted; rejection swallowed; resolves `undefined` | Ambiguous / DeliveryRejected | High | Runtime outwardly matches successful completion |
| WR-B03, B05, B09, B10, B11, B13 | no DM; resolves `undefined` | Skipped / GuideDestinationUnavailable | High except B13 medium | Read failure is internally collapsed to empty state |
| WR-B04 | fallback resolves destination and DM succeeds | Delivered / none | High | none |
| WR-B14-B19, B26-B27 | pre-send path rejects | Not Applicable / Unknown | High | Event caller, not function, catches |
| WR-B23 | repeated calls issue repeated DMs | Delivered per invocation | High | no dedupe |
| WR-B24-B25 | caller awaits but ignores completion value | Not Applicable | High | no caller-visible result |
| WR-B29 | unknown Discord rejection swallowed | Ambiguous / Unknown | Low | reason is not observable |

All 30 frozen branch IDs are represented in `tests/fixtures/community/community-welcome-delivery-result-cases.json`. No branch currently returns a Result object.
