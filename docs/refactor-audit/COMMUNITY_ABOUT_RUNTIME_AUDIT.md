# Community About Runtime Audit

## Before migration

```text
src/index.js
  -> commandRegistry.getCommandRegistry()
  -> aliasRegistry.loadAliases() dynamically requires legacy command files
  -> src/legacy/commands/community-about.js
  -> systems/communityConcierge.buildAboutEmbed(interaction.guild)
  -> interaction.reply({ embeds: [Embed], ephemeral: true })
```

The legacy command was active through the alias registry. It had no grouped `/community about` route, dashboard consumer, script consumer, JSON/DB read, Discord client-state dependency, or dependency on Community services. It consumed only the supplied guild name through the shared Concierge embed helper.

## After migration

```text
src/index.js
  -> commandRegistry.getCommandRegistry()
  -> aliasRegistry ACTIVE_COMMANDS override for community-about
  -> presentation/commands/communityAboutCommand
  -> composition/communityAboutFeature
  -> application/community/getCommunityAboutUseCase
  -> application/community/ports/communityAboutGateway
  -> infrastructure/community/communityAboutGateway
  -> plain guild-name fact
  -> domain/community/communityAbout static facts + normalized plain embed data
  -> presentation EmbedBuilder + interaction.reply({ embeds: [Embed], ephemeral: true })

legacy/commands/community-about.js
  -> direct re-export of presentation/commands/communityAboutCommand
```

## Source-of-truth decision

`domain/community/communityAbout.js` is now the sole source of static Community About facts. The pre-existing `systems/communityConcierge.buildAboutEmbed` renders the same domain facts for compatibility. The infrastructure gateway maps only the plain guild-name fact, and presentation renders the final Embed. No second static copy of the About wording exists.

## Runtime compatibility

- Canonical command metadata remains byte-equivalent at deploy JSON level.
- The alias registry still exposes `community-about` and has the same 72 deployed command count.
- The wrapper and presentation exports share `data` and `execute` identity.
- The reply remains immediate, ephemeral, one-embed, with the same payload and propagated-error semantics.
