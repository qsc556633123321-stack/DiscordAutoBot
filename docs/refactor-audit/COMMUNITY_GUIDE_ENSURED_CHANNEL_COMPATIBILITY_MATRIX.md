# Guide Ensured Channel Compatibility Matrix

| Capability | Legacy publication | Pair constructor | Successful ensure |
| --- | --- | --- | --- |
| Channel object | required | required | yes |
| `id` | required for persistence | accepted, not validated | yes |
| `messages` | required | required | yes |
| `messages.fetch` | required for lookup | required | yes |
| `send` | required for publish | required | yes |
| Text type/name/parent/overwrites | ensure responsibility | not inspected | ensured before return |

There is no production-valid / Pair-invalid row. Some partial test doubles are
Pair-valid but not valid successful ensure results; they are not runtime proof.
