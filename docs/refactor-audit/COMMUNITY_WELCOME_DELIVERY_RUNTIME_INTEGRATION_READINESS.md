# Community Welcome Delivery Runtime Integration Readiness

| Candidate | Status | Reason |
| --- | --- | --- |
| A. Use pure message builder only | Ready with explicit exclusions | contract and builder are pure; runtime does not import them. |
| B. Mapper + builder runtime use | Needs more preparation | legacy request excludes required guild-name interpolation. |
| C. Delivery port | Rejected | no port is approved in this preparation slice. |
| D. Discord DM adapter | Rejected | no adapter is approved. |
| E. Replace `member.send` | Blocked | catch/return and lookup-to-DM behavior must remain compatible. |
| F. Full `sendConciergeWelcome` migration | Blocked | lookup, fallback, DM, and error swallowing are coupled. |
| G. No runtime integration | Ready | preserves current runtime. |

The permitted next recommendation is Candidate A only as an isolated pure artifact. It does not approve a port, adapter, full delivery migration, persistence work, channel lookup migration, Bootstrap work, or Rebuild work.
