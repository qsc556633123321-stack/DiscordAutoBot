# Community Mutation Call Graph

```text
setup-community-guide / refresh-community-guide / Bootstrap-V3 indirect
  -> setupCommunityGuide(guild, options)
  -> getOrCreateGuideChannel
     -> getOrCreateCategory -> guild.channels.create (conditional)
     -> guild.channels.create / channel.setParent (conditional)
     -> channel.permissionOverwrites.set (best effort)
  -> channel.messages.fetch -> message.edit OR channel.send
  -> saveOnboarding -> readOnboardingData -> writeJson -> fs.writeFileSync

Roadmap setup entry
  -> setupRoadmapPanel(guild)
  -> getOrCreateRoadmapChannel -> category/channel create (conditional)
  -> channel.messages.fetch -> message.edit OR channel.send
  -> saveOnboarding -> writeJson -> fs.writeFileSync
```

`guildMemberAdd -> sendConciergeWelcome` is a DM delivery path, not a Community publication mutation: it has no JSON write and no channel/message mutation.
