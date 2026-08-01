# Community Welcome Delivery Failure Reason Audit

| Reason | Runtime observable | Exact source | False-classification risk | Safe for runtime use |
| --- | --- | --- | --- | --- |
| GuideDestinationUnavailable | Partially | no resolved Guide channel after cache/fetch/fallback | read failure and lookup failure are indistinguishable | No |
| DeliveryRejected | Internally only | Promise rejection passed to inner catch | rejection is swallowed and indistinguishable to caller | No |
| Unknown | Not reliably | pre-send throws or unknown Discord errors | broad and loses original error context | No |

The vocabulary is an application contract, not a legacy runtime output. This slice does not map, log, return, or persist any reason.
