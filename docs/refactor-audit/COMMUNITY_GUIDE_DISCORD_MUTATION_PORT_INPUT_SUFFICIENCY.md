# Guide Discord Mutation Port Input Sufficiency

`GuidePublicationExecutionRequest` contains only `operation`, `payload`, and
`trackedMessageId`. This is insufficient for a Discord mutation port.

| Required port input | Present in Request | Current owner |
| --- | --- | --- |
| guild identity | No | legacy runtime |
| channel identity / send destination | No | legacy runtime |
| message identity / resolved message | No | legacy runtime |
| resource lookup boundary | No | legacy runtime |
| operation | Yes | Plan |
| payload | Yes | runtime payload builder |
| generated message ID handoff | No | result of legacy send/edit |

The Request is therefore not yet a port boundary and must not be promoted as
one merely because persistence has moved.
