# Community Guide/Roadmap Persistence Consumer Inventory

## Active consumer

| Consumer | File / function | Trigger | Access | Fields | Behavior | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Guide setup | `src/systems/communityConcierge.js:setupCommunityGuide` | `/setup-community-guide`, `/refresh-community-guide`, Bootstrap/V3 indirect setup | read + write | `guideChannelId`, `guideMessageId`, native task fields, `updatedAt` | reads guild record; publishes/edits; shallow-patches record | Active Runtime |
| Roadmap setup | `src/systems/communityConcierge.js:setupRoadmapPanel` | setup/refresh commands | read + write | `roadmapChannelId`, `roadmapMessageId`, `updatedAt` | reads guild record; publishes/edits; shallow-patches record | Active Runtime |
| Welcome link | `communityConcierge:sendConciergeWelcome` | `guildMemberAdd` path | read | `guideChannelId` | resolves saved Guide channel, otherwise name lookup | Indirect Active Runtime |
| Reader/writer helper | `communityConcierge:readJson`, `writeJson`, `readOnboardingData`, `saveOnboarding` | internal | both | root and selected guild record | sync read/parse and full-file write | Active Runtime |
| Guide read slice | `src/infrastructure/community/communityGuideContentReader.js` | read-model composition | none | none | reads `community-roadmap.json`, not onboarding state | Compatibility-only |
| Tests / harnesses | `tests/**communityGuide*` | test scripts | test-only | fixture state | fake filesystem only | Test-only |

## Contract evidence

- Exact path: `src/data/onboarding-flows.json` resolved from `communityConcierge`.
- Root is expected to be an object keyed by `guild.id`.
- `saveOnboarding()` performs `data[guildId] = { ...(data[guildId] || {}), ...patch, updatedAt }`.
- Parse failure returns `{}` after logging; missing file is created before reading.
- Writes are synchronous `writeFileSync`, full-file, two-space JSON plus one newline; write errors are logged and swallowed.
- No separate persistence consumer, repository, port, or transaction abstraction currently exists.

## Caller classification

`/setup-community-guide` and `/refresh-community-guide` are Active Runtime.
Bootstrap/V3 call the Guide setup indirectly; they do not establish a separate
persistence contract. The exported `refreshCommunityGuide` name has no source
consumer and is **Dead / No Consumer**.
