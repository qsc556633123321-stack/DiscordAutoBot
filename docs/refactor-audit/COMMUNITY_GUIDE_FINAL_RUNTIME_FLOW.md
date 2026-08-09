# Community Guide Final Runtime Flow

`setupCommunityGuide(guild, options)` has the following active production flow:

1. Runtime: `getOrCreateGuideChannel(guild)` ensures the target channel.
2. Composition: `communityGuideAdapterPairFeature.createAdapterPair({ ensuredChannel: channel })` creates one per-invocation Guide resource session and its lookup/mutation ports.
3. Presentation/read composition: `buildGuidePayload(guild)` delegates Guide content rendering through the approved read feature.
4. Shared compatibility helper: `readOnboardingData()[guild.id]` reads the legacy record solely to derive the tracked Guide message ID.
5. Application: `fromLegacyPublicationRecord` and `lookupPort.lookup` classify the tracked message.
6. Infrastructure: the lookup adapter/session performs Discord fetch work and retains an available message.
7. Application: `buildGuidePublicationMutationPlan` selects Edit or Send.
8. Infrastructure: `mutationPort.edit` or `mutationPort.send` performs the Discord mutation and hands off the retained message.
9. Runtime: retained-message and mutation-result identity invariants are checked.
10. Application/composition: `createGuidePersistenceRequest` and `createCommunityGuidePersistenceFeature` map the four-field Guide update to the shared publication persistence feature.
11. Persistence: one synchronous generic execute persists the atomic patch; its result is intentionally ignored.
12. Runtime: returns the exact retained `{ channel, message }` identity.

The runtime itself performs no direct fetch, edit, send, generic persistence execute, repository access, or filesystem write within this flow.
