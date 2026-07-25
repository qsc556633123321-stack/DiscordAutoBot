# Community Guide Mutation Baseline Runtime

Baseline commit: `c2b82a0 docs: complete community mutation runtime discovery`.
This document was traced again from production source for the mutation baseline;
it is not a copy of the Discovery summary.

## Source Search Evidence

| Search target | Production evidence | Baseline conclusion |
| --- | --- | --- |
| `setup-community-guide` | `src/legacy/commands/setup-community-guide.js` | Active slash command, deferred ephemeral response. |
| `refresh-community-guide` | `src/legacy/commands/refresh-community-guide.js` | Active slash command, deferred ephemeral response. |
| `setupCommunityGuide` | `src/systems/communityConcierge.js` and both command files | Single current Guide publication implementation. |
| `refreshCommunityGuide` | no production export/function found | Refresh is an option passed to `setupCommunityGuide`, not a separate function. |
| `buildGuidePayload` | `communityConcierge.js` | Uses the existing Guide read compatibility adapter. |
| `buildRoadmap` | `buildRoadmapEmbed` and `setupRoadmapPanel` in `communityConcierge.js` | Roadmap publication remains coupled to the command workflow. |
| `onboarding-flows.json` | `ONBOARDING_FILE`, `readOnboardingData`, `saveOnboarding` | Current guide/roadmap record store. |
| guide/roadmap message IDs | `guideMessageId`, `roadmapMessageId` in `setupCommunityGuide`/`setupRoadmapPanel` | Stored per guild and used for tracked-message fetch. |
| `channel.send`, `message.edit`, `messages.fetch` | both publication functions | Current send/edit fallback contract. |
| `permissionOverwrites` | `getOrCreateGuideChannel` | Guide overwrite is always attempted and failures are swallowed. |
| `writeFileSync`, `JSON.stringify` | `writeJson` | JSON writes are synchronous and write failures are caught/logged. |
| `bootstrap`, `rebuild-community-v3` | legacy bootstrap/V3 runtimes and commands | Indirect callers may invoke Guide refresh after broader structure work. |

## Slash Entry: Setup

```text
src/legacy/commands/setup-community-guide.js
→ execute(interaction)
→ interaction.deferReply({ ephemeral: true })
→ ManageChannels member permission check
→ setupCommunityGuide(interaction.guild, { mode: 'create' })
→ getOrCreateGuideChannel
→ guild.channels.create / channel.setParent / permissionOverwrites.set
→ channel.messages.fetch(tracked guideMessageId) OR channel.send(payload)
→ message.edit(payload) OR message send
→ saveOnboarding(... guideChannelId, guideMessageId, native recommendations)
→ setupRoadmapPanel(interaction.guild)
→ roadmap channel ensure → fetch/edit or send → saveOnboarding(... roadmap IDs)
→ interaction.editReply(success text)
```

Failure behavior is intentionally unwrapped in this command: a rejected setup or
roadmap operation prevents the final success `editReply`; command-router error
handling remains responsible for the outer interaction failure response.

## Slash Entry: Refresh

```text
src/legacy/commands/refresh-community-guide.js
→ execute(interaction)
→ interaction.deferReply({ ephemeral: true })
→ ManageChannels member permission check
→ setupCommunityGuide(interaction.guild, { mode: 'refresh' })
→ same ensure/fetch/edit-or-send/persist workflow as setup
→ setupRoadmapPanel(interaction.guild)
→ same roadmap ensure/fetch/edit-or-send/persist workflow
→ interaction.editReply(success text)
```

`refresh` differs from `create` only in the option supplied to the same Guide
function. Neither option is `force`; therefore a stored guide message ID is
fetched and edited when fetch succeeds.

## Indirect Entries

```text
legacy bootstrap/V3 runtime
→ setupCommunityGuide({ mode: 'refresh' })
→ exact same Guide channel/message/JSON mutations above
→ caller-specific bootstrap/rebuild summary
```

The indirect callers add no separate Guide publication contract. In the current
source they do not directly invoke `setupRoadmapPanel`; the direct setup/refresh
slash commands remain the verified Guide-plus-Roadmap coupling. Indirect Guide
failures may be handled as best effort after layout mutation has already
partially completed.

## Branch Baseline

| Branch | Current runtime action | Persisted result | Response/retry consequence |
| --- | --- | --- | --- |
| Existing guide channel | reuse channel; move it when parent differs; always attempt overwrite set | none until message stage | overwrite rejection is swallowed; no retry |
| Missing guide channel | create text channel under ensured entry category with initial overwrites | none until message stage | create failure rejects function; no retry |
| Existing tracked guide message | fetch stored `guideMessageId`, edit payload | guide record is written again after edit | fetch only when mode is not `force` |
| Missing tracked guide message | fetch resolves `null`, send payload | replacement `guideMessageId` is written | next run can edit replacement if JSON write succeeded |
| Fetch failure | `messages.fetch(...).catch(() => null)`, then send | replacement ID write attempted | no fetch retry; can duplicate if prior tracked message still exists |
| Message edit failure | edit rejection escapes `setupCommunityGuide` | no later `saveOnboarding` in that invocation | no local retry; no success reply from direct command |
| Message send failure | send rejection escapes `setupCommunityGuide` | no later `saveOnboarding` | no local retry |
| JSON write failure | `writeJson` catches/logs `writeFileSync` failure | Discord message/channel already remains | function still resolves; future run can publish again because ID was not saved |
| Guide overwrite failure | overwrite `.catch(() => null)` | channel/message work continues | no retry, no command-visible warning from this helper |
| Roadmap tracked message | fetch/edit or send under same record file | roadmap IDs saved | command setup/refresh always calls roadmap after Guide succeeds |

## Baseline Invariants

1. The Guide payload remains provided by the existing Guide Read compatibility
   adapter; this baseline does not redefine its content.
2. `setupCommunityGuide` always attempts guide permission overwrites after the
   locate/create/move branch.
3. Send occurs before record persistence. This preserves the existing
   partial-success/duplicate-publication window.
4. `writeJson` absorbs JSON write errors. Message edit/send failures are not
   absorbed by the Guide publication functions.
5. Setup and refresh both publish the Roadmap after successful Guide publication.
6. There is no dedicated retry loop. Re-running the command is the operational
   retry mechanism.
