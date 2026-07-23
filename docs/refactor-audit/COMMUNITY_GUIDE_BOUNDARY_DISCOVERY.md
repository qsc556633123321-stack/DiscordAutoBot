# Community Guide Boundary Discovery

## What Guide is today

Guide is the interactive Concierge experience centered on `🧭｜伺服器導覽`. It presents an introductory Embed, navigation and interest buttons, a Roadmap view, optional AI-generated wording, quick links derived from guild channel names, a newcomer DM, and a `/help-me-start` recommendation Embed. It is not a single read-only feature: setup owns Discord structure/message state and buttons can grant roles.

## Commands, buttons, panels, and content

| Surface | Current implementation | Content / behavior | Effect classification |
| --- | --- | --- | --- |
| `/setup-community-guide` | legacy command -> `setupCommunityGuide` + `setupRoadmapPanel` | creates/refreshes Guide and Roadmap panels | Mutation |
| `/refresh-community-guide` | legacy command -> same functions | refreshes stored panel messages | Mutation |
| `/help-me-start` | legacy command -> `buildHelpMeStartEmbed` | recommendation by game, style, and online time | Read-only reply; optional AI network call |
| `concierge_games` | Concierge button | game links and quick-add `🎮 遊戲玩家` | Role mutation + reply |
| `concierge_night` | Concierge button | Night Crew explanation and links | Read-only reply |
| `concierge_bot` | Concierge button | Community OS capability description | Read-only reply |
| `concierge_invest` / `concierge_dev` | Concierge button | interest links and quick-add role | Role mutation + reply |
| `concierge_roadmap` | Concierge button | Roadmap Embed | Read-only reply |
| `panel_show_guide` | panel fallback button | textual/navigational response | Compatibility consumer |
| `panel_open_roles` / `role_select_menu` | panel/role fallback | role picker and role update | Roles mutation; not Guide-owned |
| Guide panel | `buildGuideEmbed`, `buildGuideRows` | welcome, games, voice, social, AI, investment, development, proposal orientation | Pure renderer candidate |
| Roadmap panel | migrated Roadmap composition / renderer | sections and items from JSON/fallback contract | Completed separate read slice |

## Answered boundary questions

1. **What is Guide?** An interactive Community Concierge/navigation feature with setup, message, role, and welcome integrations.
2. **Commands?** `setup-community-guide`, `refresh-community-guide`, and `help-me-start`; `community-about` and `community-roadmap` are separate completed slices.
3. **Buttons?** `concierge_games`, `concierge_night`, `concierge_bot`, `concierge_invest`, `concierge_dev`, `concierge_roadmap`, plus panel navigation consumers.
4. **Panels?** Main Guide panel and a Roadmap panel published alongside it; panel system separately emits guide/role/navigation panel types.
5. **Displayed content?** Community introduction, feature orientation, channel recommendations, role suggestions, Night Crew explanation, and Roadmap.
6. **Content sources?** Static Concierge strings, guild name/channel cache, `onboarding-flows.json` message IDs, Roadmap composition, and optional OpenAI response with fallback text.
7. **Guild state?** Yes: name, channel cache/fetch, category/channel presence, bot permissions, and recorded message IDs.
8. **Member state?** Yes for button clicks and newcomer DM.
9. **Role state?** Yes: role lookup, editability, bot hierarchy, and current member role set.
10. **Modifies roles?** Yes: games, investment, and development Concierge buttons can call `member.roles.add`.
11. **Modifies visibility?** Guide setup applies the onboarding-visible overwrite template; role assignment only has later indirect visibility consequences through shared permission policy.
12. **Creates messages?** Yes: send or edit Guide/Roadmap panels and sends newcomer DM.
13. **Pins messages?** No direct Guide pin operation was found.
14. **Writes JSON?** Yes: Guide/Roadmap IDs and native-task recommendation metadata in `onboarding-flows.json`.
15. **Shares onboarding handler?** Yes: welcome event calls `sendConciergeWelcome`; guide setup writes onboarding metadata.
16. **Shares panel renderer?** It builds its own Guide Embed/rows; Roadmap now uses its dedicated migrated renderer; channel panels own separate panel renderers.
17. **Shares role mutation?** Yes: Concierge has direct quick-add logic while panel role selection uses role manager runtime, so current role mutation is duplicated across boundaries.
18. **Pure read query?** Yes: Guide content, quick-link calculation from supplied channel facts, and `/help-me-start` recommendation can be separated.
19. **Pure renderer?** Yes: `buildGuideEmbed`, `buildGuideRows`, and the recommendation Embed construction are candidate pure renderers once inputs are normalized.
20. **Should setup be independent mutation slice?** Yes. It creates/moves channels, applies overwrites, publishes/edits messages, and persists IDs; it must not be bundled with a read query.

## Candidate capabilities grounded in current code

| Candidate capability | Current source | Classification | Required inputs / output | Coupling / reason to defer |
| --- | --- | --- | --- | --- |
| `GetGuideContent` | static Guide strings + `buildGuideEmbed` | Read Slice Candidate | guild display name and optional intro -> plain Embed model | Optional OpenAI wording must remain an adapter concern. |
| `GetGuideStatus` | onboarding record + guild channel/message lookup | Read Slice Candidate | guild/channel/message facts -> status model | Must not create missing channels. |
| `RenderGuideMessage` | `buildGuideEmbed`, `buildGuideRows` | Shared pure renderer candidate | plain Guide model -> embed/components payload | Custom IDs must remain byte-for-byte compatible. |
| `GetQuickLinks` | `listChannelsByPatterns`, `quickLinks` | Read Slice Candidate | normalized channel facts + kind -> links | Current name-pattern matching is a behavior contract to snapshot. |
| `GetHelpMeStartRecommendation` | `buildBaseRecommendation` | Read Slice Candidate | answer values -> channels/roles recommendations | Existing optional AI text should be isolated behind a port. |
| `PublishGuidePanel` | `setupCommunityGuide` | Mutation Slice Candidate | guild ID + publication intent -> result | channel/category ensure, overwrite, message, onboarding JSON. |
| `RefreshGuidePanel` | `setupCommunityGuide`, `setupRoadmapPanel` | Mutation Slice Candidate | recorded IDs + payload -> result | stale-message recovery, JSON update, Roadmap compatibility. |
| `HandleGuideButton` | `handleConciergeButton` | Split candidate | button kind + member/guild facts -> reply intent | Must split read buttons from role-grant buttons. |
| `AssignGuideRole` | `maybeAddRole` | Shared mutation | member ID + named role -> explicit result | Must converge with Roles / MemberGuard inheritance; do not duplicate it. |
| `UpdateGuideVisibility` | `getOrCreateGuideChannel` | Shared mutation | guide channel + visibility template -> result | Permission Repair owns visibility policy / overwrite writing. |
| `SendConciergeWelcome` | `sendConciergeWelcome` | Deferred event integration | member/guild/onboarding record -> DM intent | Ordered behind MemberGuard / Welcome event path. |

## Recommended separation

```text
Guide Read Slice Candidates
  - GetGuideContent
  - GetGuideStatus
  - RenderGuideMessage
  - GetQuickLinks
  - GetHelpMeStartRecommendation
  - read-only Concierge buttons: night, bot, roadmap

Guide Mutation Slice Candidates
  - PublishGuidePanel
  - RefreshGuidePanel
  - role-grant Concierge buttons

Guide Shared Infrastructure
  - Discord channel/message repository
  - Discord permission writer
  - role mutation gateway / inheritance policy
  - JSON onboarding repository
  - OpenAI wording adapter
  - server logger

Guide Deferred Coupling
  - guildMemberAdd ordering with MemberGuard and Welcome System
  - native onboarding visibility / task recommendations
  - channel panel custom-ID routing
  - Roadmap publication compatibility contract
  - V3 rebuild post-actions
```

## Next recommended slice

Migrate `/help-me-start` only: first baseline its exact embed payload (including optional-AI fallback), then build a query use case and renderer behind a narrow guild-channel read port. It has no JSON write, no role mutation, no channel setup, and no interaction registry change. Guide publication, role grants, and newcomer DM must remain deferred.
