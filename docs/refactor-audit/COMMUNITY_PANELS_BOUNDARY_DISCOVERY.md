# Community Panels Boundary Discovery

| Panel | Renderer | Source | Publisher | Interaction Handler | Mutation | Stored Message ID | Refresh Strategy | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Guide Panel | `buildGuideEmbed` / `buildGuideRows` | static Concierge text, guild name, optional AI text | `setupCommunityGuide` | `concierge_*` via interaction fallback | channel/category ensure, overwrite set, send/edit, onboarding write | `onboarding-flows.json.guideMessageId` | fetch/edit; send when missing | Community Guide |
| Roadmap Panel | migrated Roadmap renderer | Roadmap JSON/fallback | `setupRoadmapPanel` | `concierge_roadmap` returns embed | send/edit + onboarding write | `onboarding-flows.json.roadmapMessageId` | fetch/edit; send when missing | Roadmap read slice + Guide publisher compatibility |
| Role Panel | `buildPanel('role_select')` | role option helper | channel panels runtime | `role_select_menu` | send/edit/delete panel record; role selection mutates separately | `channel-panels.json` | create/refresh/force | Roles + Panels |
| Proposal Panel | `buildPanel('game_suggestions')` | target channel inference | channel panels runtime | `panel_suggest_game`, proposal buttons/modal | message lifecycle; proposal mutation delegated | `channel-panels.json` | create/refresh/force | Panels + Proposals |
| Welcome Panel | `buildWelcomeEmbed` / components | member and welcome/rules channel | Welcome System event | panel IDs route to role/guide/ticket consumers | welcome channel send + optional DM | no durable message ID | new message per permitted join | Welcome / Onboarding |
| Channel Panel | `buildPanel` variants | channel name/type/game inference | `setupChannelPanels` | `panel_*` fallback | send/edit/delete and JSON records | `channel-panels.json` | create skips record; refresh edits; force deletes recorded bot message then re-sends | Panels |
| Voice-related panel | Temp Voice/LFG/Voice Hub renderers | temp voice and activity state | Voice runtimes | `tempvoice_*`, LFG buttons | room/message lifecycle | temp voice / LFG / hub JSON | Voice-owned | Voice | 
| Admin / setup panel | panel runtime admin variant | admin channel inference | `setupChannelPanels` | hints and admin actions | message lifecycle only; action may delegate elsewhere | `channel-panels.json` | create/refresh/force | Panels / Admin |

## Findings

1. Renderers can be made pure: Guide row/embed builder, Roadmap renderer (already separated), Welcome embed/components, and `buildPanel` are payload construction functions when supplied plain inputs.
2. Publishing is currently mixed with rendering in `setupCommunityGuide`, `setupRoadmapPanel`, and `applyPanelToChannel`; no new universal framework should be introduced before individual ownership is clarified.
3. `refresh` edits the recorded message when fetch succeeds; a missing/stale recorded message causes a new send. `force` deletes only a recorded message fetched from the target channel, then removes its record and re-sends.
4. Message ID stores are intentionally separate: onboarding flow for Guide/Roadmap; channel-panels JSON for channel panels; Voice-specific JSON for voice surfaces; Welcome has no durable record.
5. Custom IDs route through `interactionGateway` then specialized mapping or legacy fallback. Most panel IDs are still legacy-owned; this is a compatibility boundary.
6. Voice panels do not belong to Community. Ticket panel behavior belongs to ticket support. Role panel rendering is shared with Roles; proposal panel is shared with Proposals.
7. A shared Presentation helper may later contain only narrow payload/message-record primitives after exact behavior fixtures. A generic Panel Framework would hide ownership and is explicitly not recommended.
