# Community Guide Read Migration Report

## Scope completed

The pure Community Guide read/render path has moved into:

- `src/domain/community/guideReadModel.js`
- `src/application/community/getCommunityGuide.js`
- `src/application/community/getCommunityGuideStatus.js`
- `src/infrastructure/community/communityGuideContentReader.js`
- `src/infrastructure/community/discordGuideGuildFactsReader.js`
- `src/infrastructure/community/jsonGuideStatusReader.js`
- `src/presentation/community/communityGuideRenderer.js`
- `src/composition/community/createCommunityGuideReadFeature.js`

`src/systems/communityConcierge.js` remains in place as the compatibility consumer. Its `buildGuidePayload()` thin delegation uses the new read feature; the rest of `setupCommunityGuide()` remains legacy mutation behavior.

## Compatibility result

Focused Domain, Application, Infrastructure, Presentation, Composition, vertical-slice, compatibility-consumer, boundary, and migration tests compare the real composed payload with the frozen legacy baseline. The Embed fields and component JSON are preserved, apart from the expected live timestamp value.

Guide status keeps the existing onboarding-flow fallback behavior: missing, malformed, and non-object JSON return an empty status object without writing a file.

## Deferred work

The following remain outside this migration: setup, refresh, publish, channel creation, message edits/sends, status writes, role selection, Concierge button behavior, onboarding events, panels, proposals, permissions, Voice, layout, and MemberGuard.

## Rollback

Revert the delegation in `src/systems/communityConcierge.js` and the new read-slice files as one commit. The legacy mutation workflow remains intact, so no data rollback is required.
