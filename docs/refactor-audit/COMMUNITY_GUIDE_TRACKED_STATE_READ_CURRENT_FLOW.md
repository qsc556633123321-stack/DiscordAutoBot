# Community Guide Tracked State Read: Current Flow

`setupCommunityGuide` currently reads tracked publication state exactly once:

```js
const data = readOnboardingData()[guild.id] || {};
const publicationState = fromLegacyPublicationRecord(guild.id, data);
const guideMessageId = publicationState.guide.messageId || data.guideMessageId;
```

`readOnboardingData` delegates to `readJson(ONBOARDING_FILE, {})`. Missing files are initialized with `{}`; malformed JSON or read errors are logged and resolve to `{}`. A missing guild or missing Guide ID therefore leaves `guideMessageId` falsy, skips lookup, and selects Send.

`fromLegacyPublicationRecord` is the existing Application mapper. It produces the approved `CommunityPublicationState`, normalizing non-blank string IDs, while the `|| data.guideMessageId` fallback deliberately preserves the legacy truthy-malformed-ID lookup behavior. The derived ID is passed once to `lookupPort.lookup`; the runtime does not otherwise require the guild record.
