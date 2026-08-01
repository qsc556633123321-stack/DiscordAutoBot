# Community Welcome Delivery Runtime Integration Readiness

| Candidate | Status | Reason |
| --- | --- | --- |
| A. Use pure message builder only | Complete | prepared and consumed through the approved runtime path. |
| B. Mapper + builder runtime use | Complete | runtime passes existing `guildName` as explicit builder context while request remains two-field. |
| C. Delivery port | Rejected | no port is approved in this preparation slice. |
| D. Discord DM adapter | Rejected | no adapter is approved. |
| E. Replace `member.send` | Blocked | catch/return and lookup-to-DM behavior must remain compatible. |
| F. Full `sendConciergeWelcome` migration | Blocked | lookup, fallback, DM, and error swallowing are coupled. |
| G. No runtime integration | Ready | preserves current runtime. |

No additional Welcome Runtime Integration is approved. This does not approve a result/failure integration, port, adapter, full delivery migration, persistence work, channel lookup migration, Bootstrap work, or Rebuild work.
