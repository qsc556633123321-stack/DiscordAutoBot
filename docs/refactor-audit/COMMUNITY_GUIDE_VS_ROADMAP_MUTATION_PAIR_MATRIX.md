# Community Guide vs Roadmap Mutation Pair Matrix

| Capability | Guide Pair | Roadmap current | Roadmap candidate A |
| --- | --- | --- | --- |
| Lookup Port | Yes | Yes | Yes |
| Mutation Port | Yes | No | Yes |
| Retained Message getter | Yes | Yes | Yes |
| Failure getter | Yes | No | No |
| Shared Session | Yes | Lookup only | Lookup and mutation |
| Persistence | Outside Pair | Outside Pair | Outside Pair |
| Runtime mutation use | Yes | Legacy direct | Deferred |

Roadmap must not copy Guide's failure getter: the Roadmap mutation port already
propagates exact raw failures and no approved consumer requires diagnostics.
