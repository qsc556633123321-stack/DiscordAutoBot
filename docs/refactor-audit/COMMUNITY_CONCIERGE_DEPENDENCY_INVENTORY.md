# Community Concierge Dependency Inventory

## Imports

| Dependency group | Purpose | Construction/usage owner |
| --- | --- | --- |
| `node:fs`, `node:path` | local onboarding JSON path/read/ensure | Runtime |
| `discord.js` | channel types, embeds, role permission check | Runtime |
| `permissionTemplates` | Guide onboarding visibility overwrite | Runtime |
| Application community exports | welcome payload, Guide planning | Application consumer |
| Domain About model | About embed model | Domain consumer |
| Composition features | Roadmap, Guide read, persistence, adapter pairs | Runtime composition consumer |
| Application ports/requests | tracking and persistence contracts | Runtime request construction |
| Infrastructure tracking adapters and reader | compatibility tracking reads | Runtime per-invocation construction |

## Direct factory sites

| Factory | Sites | Lifetime | Consumer |
| --- | ---: | --- | --- |
| `createCommunityOnboardingStateReader` | 3 | per invocation | Guide, Roadmap, Welcome |
| Message tracking adapter | 2 | per invocation | Guide, Roadmap |
| Channel tracking adapter | 1 | per invocation | Welcome |
| Publication state feature | 2 | per invocation | Guide, Roadmap persistence |
| Guide/Roadmap persistence feature | 1 each | per invocation | publication persistence |
| Guide/Roadmap adapter pair feature | module-level feature; per-call pair | Guide, Roadmap | lookup/mutation |

No new Composition feature is required merely to document this construction.
