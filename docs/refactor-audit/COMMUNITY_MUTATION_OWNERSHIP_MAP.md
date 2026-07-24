# Community Mutation Ownership Map

| Mutation | Current owner | Required future boundary |
| --- | --- | --- |
| Message send/edit/delete | Concierge, panel, proposal, Voice runtimes | feature-specific Discord message gateway |
| Channel create/edit/move/delete | bootstrap, rebuild, proposal, maintenance runtimes | Discord channel repository, invoked by feature workflow |
| Role create/add/remove | role, welcome, MemberGuard, Night Crew runtimes | role gateway with hierarchy checks |
| Permission overwrite mutation | bootstrap, V3, Guest Gate, role permissions | permission writer / repair workflow |
| JSON write | each legacy runtime's local file helper | feature repository behind a port |
| DM send | welcome and Concierge | onboarding message gateway |

No shared `DiscordMutationService` should become an orchestration owner. Shared adapters should execute a narrow Discord operation only; feature workflows own sequencing and business decisions.
