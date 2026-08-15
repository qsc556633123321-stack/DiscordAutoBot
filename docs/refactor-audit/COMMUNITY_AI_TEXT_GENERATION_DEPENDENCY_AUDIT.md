# Community AI Text Generation Dependency Audit

| Responsibility | Current owner | Recommended future owner |
| --- | --- | --- |
| Prompt semantics and request construction | Concierge runtime | Concierge runtime |
| OpenAI lazy import and client construction | Concierge runtime | Infrastructure adapter |
| OpenAI request transport | Concierge runtime | Infrastructure adapter |
| Response normalization | Concierge runtime | Infrastructure adapter |
| Fallback on no key/failure | Concierge runtime | Infrastructure adapter |
| Discord presentation/reply | Existing callers | Existing callers |

The proposed adapter must not import Discord, filesystem, Domain, Application,
or persistence. The Application layer has no required role in this narrow
external transport extraction.
