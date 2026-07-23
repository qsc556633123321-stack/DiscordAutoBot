# Community Roadmap Runtime Audit

## Before migration

```text
command registry
  -> aliasRegistry dynamic legacy loader
  -> legacy/commands/community-roadmap.js
  -> systems/communityConcierge.buildRoadmapEmbed()
  -> Concierge readJson(community-roadmap.json)
  -> EmbedBuilder
  -> interaction.reply(ephemeral)
```

The same `buildRoadmapEmbed()` helper is also used by the Concierge roadmap button and guide-panel refresh paths. Those consumers are retained and are not migrated in this slice.

## After migration

```text
command registry
  -> aliasRegistry active override for community-roadmap
  -> presentation/commands/communityRoadmapCommand.js
  -> composition/communityRoadmapFeature.js
  -> application/community/getCommunityRoadmapUseCase.js
  -> application port
  -> infrastructure/community/communityRoadmapGateway.js
  -> domain/community/communityRoadmap.js
  -> modules/community/communityRoadmapEmbed.js
  -> interaction.reply(ephemeral)
```

`communityConcierge.buildRoadmapEmbed()` is now a compatibility consumer of the same composed read path and renderer. It keeps its public timestamped embed behavior for existing guide/button runtime paths.

## Discovery findings

- No duplicate slash command, prefix command, Dashboard consumer, Dashboard writer, startup preload, JSON `require()` cache, or Roadmap writer was found.
- `setupRoadmapPanel()` is an existing message mutation path and remains untouched.
- The new active command is read-only: it has no Guild, Client, channel, message, role, JSON write, or Discord mutation dependency.
- The JSON adapter is the one active source reader. It reads UTF-8 synchronously, returns the legacy compatibility fallback snapshot on missing/parse-invalid/non-object data, and never writes the file. The formal editable source remains `src/data/community-roadmap.json`; the fallback is not an editable source and may drift until a dedicated data-contract change reconciles it.
