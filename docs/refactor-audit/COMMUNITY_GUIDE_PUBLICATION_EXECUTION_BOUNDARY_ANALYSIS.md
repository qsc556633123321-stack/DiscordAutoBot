# Community Guide Publication Execution Boundary Analysis

Application owns only the existing pure decision vocabulary and plan. The legacy runtime owns lookup, message edit/send, ID extraction, JSON writer invocation, Roadmap continuation at the command level, and interaction responses. Infrastructure concerns are Discord message mutation and filesystem persistence.

| Separation | Status | Reason |
| --- | --- | --- |
| Plan decision vs execution | Yes with exclusions | plan is pure, runtime does not consume it |
| edit vs send | Yes as description only | both require live Discord objects/payload |
| Discord vs persistence | No | one legacy function sequences both |
| Guide vs Roadmap | Yes at direct function level | commands couple them sequentially |
| execution vs interaction response | Yes | command owns reply behavior |
