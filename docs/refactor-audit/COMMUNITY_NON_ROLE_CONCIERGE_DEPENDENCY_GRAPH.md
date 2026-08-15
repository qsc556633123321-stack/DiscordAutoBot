# Community Non-role Concierge Presentation Dependency Graph

```text
customId -> CommunityConciergeButtonActionResolver -> semantic action
semantic action -> handleConciergeButton
night -> quickLinks(guild, 'night') -> guild channel cache -> EmbedBuilder -> interaction.reply
bot -> EmbedBuilder -> interaction.reply
roadmap -> buildRoadmapEmbed -> CommunityRoadmapFeature -> createCommunityRoadmapEmbed -> interaction.reply
```

The future presentation boundary receives semantic action and resolved presentation inputs, returns a payload, and leaves reply ownership in the runtime. It must not import Application resolver code, role workflow code, filesystem code, or Discord mutation services.
