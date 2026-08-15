# Community Non-role Concierge Presentation Implementation Result

The new Module/Presentation owner is `src/modules/community/CommunityNonRoleConciergePresentation.js`.

- Night payload: Module-owned; runtime still resolves `quickLinks(guild, 'night')`.
- Bot payload: Module-owned with no external presentation dependency.
- Roadmap button payload: Module-owned and delegates to the existing shared `buildRoadmapEmbed` dependency exactly once.
- Runtime reply ownership: unchanged; `handleConciergeButton` awaits one `interaction.reply(payload)` and returns `true`.
- Error ownership: unchanged; builder throws propagate to the modern `communityConciergeButtons` wrapper.

The semantic resolver, prefix dispatch, role workflow, Guide/Roadmap/Welcome flows, filesystem, persistence, and JSON were not changed.
