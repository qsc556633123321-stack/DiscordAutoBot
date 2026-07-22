# Community Architecture Draft

This is a design draft only. It creates no runtime code and does not change the current adapter/legacy boundary.

```text
src/domain/community/
  communityFacts.js             # category/role/channel semantic facts
  onboardingPolicy.js           # allowed native onboarding channels
  roleAccessPolicy.js           # pure role inheritance/access decisions
  communityPlanPolicy.js        # validates intended structural operations

src/application/community/
  queryCommunityAboutUseCase.js
  queryCommunityRoadmapUseCase.js
  inspectOnboardingUseCase.js
  buildCommunityGuideUseCase.js
  planCommunityBootstrapUseCase.js
  applyCommunityPermissionPlanUseCase.js

src/application/community/ports/
  communityReadGateway.js
  communityMutationGateway.js
  communityMessageGateway.js
  communitySettingsRepository.js

src/infrastructure/discord/
  discordCommunityReadGateway.js
  discordCommunityMutationGateway.js
  discordCommunityMessageGateway.js
src/infrastructure/storage/
  jsonCommunitySettingsRepository.js
src/composition/communityFeature.js
src/presentation/commands/community*.js
src/adapters/community/communityEventAdapter.js
```

## Boundaries

- **Domain** receives plain category, channel, role, and visibility facts; it never imports Discord.js, storage, Voice, MemberGuard, Layout, or infrastructure.
- **Application** receives IDs/plain facts and port interfaces. It owns one workflow/use case and never receives raw Discord objects.
- **Infrastructure** maps Discord objects/cache/fetch/retry and JSON contracts to ports. Channel/role/permission mutations live here.
- **Presentation** owns slash metadata, option parsing, interaction acknowledgement, embed rendering, and calls a composed use case.
- **Composition** is the only place that selects infrastructure implementations and retained legacy fallback adapters.

## Subdomain boundaries

1. Community Core: architecture facts and semantic identifiers.
2. Onboarding: welcome/guide/native-task eligibility and read-only discovery.
3. Roles: self roles and role inheritance; must expose a narrow role-access API to MemberGuard.
4. Bootstrap: initial categories/channels/roles; consumes a mutation port.
5. Proposals: suggestion/review workflow; calls a game-category API, never Voice internals.
6. Layout: owns diagnostics/optimization decisions; receives structural facts from Community but owns neither Discord mutation nor Community policy.
7. Permissions: policy-plan and application are separate; an overwrite gateway applies approved plans.
8. Maintenance: reconciles plan results and logs but does not own cleanup/delete policy.

## Cross-feature APIs

- Voice receives `{ gameId, displayName, createEntryChannelId, parentCategoryId }` and returns status only.
- MemberGuard asks role-access policy for guest/member facts; it owns enforcement.
- Layout asks Community Core for known category/channel/role semantics, then returns plain candidate actions.
- Permission Repair receives a policy plan and uses a mutation port; it is not embedded in Layout rules.

## Legacy compatibility

Each migrated command becomes a presentation wrapper/adapter retaining the same slash name and response contract. The legacy source remains behind a measured fallback port until regression tests, production observation, and a dedicated retirement change remove it.
