# Guide Discord Mutation Legacy Resource Audit

| Resource/action | Current owner | Future adapter owner | Outside adapter |
| --- | --- | --- | --- |
| Guild ID | legacy runtime input | audit/context resolution candidate | no |
| Guide channel ensure | legacy `getOrCreateGuideChannel` | no | yes |
| Channel object | ensured legacy channel | resolve by `channelId` | no |
| Stored message ID | onboarding record | scalar Edit request | no |
| Message fetch | pre-Plan, one fetch, `.catch(() => null)` | candidate lookup after request only | no |
| Force bypass | legacy mode/Plan input | no | yes |
| `message.edit(payload)` | legacy runtime | future Edit mutation | no |
| `channel.send(payload)` | legacy runtime | future Send mutation | no |
| returned `message.id` | legacy persistence handoff | scalar success mapping | no |
| persistence/Roadmap/interaction | outer workflow | no | yes |

Malformed truthy IDs are fetched today; a fetch rejection is converted to null
before branch selection. That exact timing is the adapter redirect blocker.
