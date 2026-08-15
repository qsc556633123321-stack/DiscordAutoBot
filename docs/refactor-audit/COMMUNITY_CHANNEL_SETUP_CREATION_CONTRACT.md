# Community Channel Setup Creation Contract

## Category

`guild.channels.create({ name, type: GuildCategory, reason: 'Community concierge setup' })`.
No parent, topic, explicit overwrite, position, or retry is supplied.

## Guide

The Guide is `GuildText`, parented to the entry category at create time, uses
`permissionTemplates.onboardingVisible(guild)`, and has reason `Community guide
setup`. Existing channels can be moved with `lockPermissions:false`. Every
successful Guide ensure attempts `permissionOverwrites.set(...)`; rejection is
swallowed to `null`. No topic or position is set.

## Roadmap

The Roadmap is `GuildText`, parented to its category at create time, with
reason `Community roadmap setup`. It has no create overwrite, post-create
overwrite, topic, parent repair, position, or retry behavior.

Ordering is category ensure → channel ensure → the existing publication flow.
