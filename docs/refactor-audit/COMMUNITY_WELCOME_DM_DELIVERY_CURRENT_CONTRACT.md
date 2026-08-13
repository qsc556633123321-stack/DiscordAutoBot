# Community Welcome DM Delivery Current Contract

`sendConciergeWelcome` awaits `member.send(payload).catch(() => null)`.

| Case | Observable behavior |
| --- | --- |
| Success | Exact Member receives the exact payload once; function resolves `undefined`. |
| Rejection | Rejection is swallowed to `null`; no throw, retry, log, channel fallback, or interaction reply. |
| No resolved channel | `member.send` is not called; function resolves `undefined`. |

Payload construction remains the existing Application boundary. This audit does
not change payload content, recipient identity, or delivery failure semantics.
