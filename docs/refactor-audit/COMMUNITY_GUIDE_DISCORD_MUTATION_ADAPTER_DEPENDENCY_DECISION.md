# Guide Discord Mutation Adapter Dependency Decision

Selected future dependency: a minimal injected **Discord resource gateway**.

| Option | Decision | Reason |
| --- | --- | --- |
| Discord client | Rejected | broad API surface and hidden lookup policy |
| Guild resolver only | Rejected | cannot isolate channel/message behavior |
| Channel resolver only | Rejected | lacks message mutation seam |
| Raw Guide channel object | Rejected | leaks runtime object into adapter caller |
| Multiple callbacks | Rejected | unclear lifecycle and testing contract |
| Resource gateway | Candidate | explicit lookup/mutation operations; easy call-order tests |

The future gateway may receive raw Discord objects internally, but the future
adapter must expose only the Application Port's scalar request/result contract.
