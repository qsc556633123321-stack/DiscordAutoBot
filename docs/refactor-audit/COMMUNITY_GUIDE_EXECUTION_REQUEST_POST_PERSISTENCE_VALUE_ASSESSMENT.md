# Guide Execution Request Post-Persistence Value Assessment

| Concern | Assessment | Evidence |
| --- | --- | --- |
| Stable execution data shape | Partial | operation/payload/trackedMessageId are stable values, but no destination/reference exists. |
| Lower runtime coupling | No | runtime still resolves and owns concrete message/channel objects. |
| Lower Discord coupling | No | edit/send remain direct legacy Discord calls. |
| Persistence handoff | Partial | persistence is now separate, but Request is not involved in the handoff. |
| Result mapping | Partial | result contract exists, but runtime does not map to it. |
| Test seam | Partial | pure Request mapping can be tested; actual Discord execution remains inline. |
| Future port value | Low | a port would additionally need guild/channel/message identity and resource lookup/destination inputs. |

`operation` is useful only as a copy of the already-made Plan decision.
`payload` is needed by either inline Discord call. `trackedMessageId` is
currently redundant at execution time: lookup already happened before Plan
creation; edit uses the resolved message object, and send uses the resolved
channel object. It has diagnostic value but creates no current runtime seam.

## Decision

Do not integrate Execution Request into the active runtime. It would add a
local-value wrapper without reducing Discord coupling, object leakage, or
future migration blast radius.
