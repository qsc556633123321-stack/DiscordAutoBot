# Community Concierge Direct Discord Operations Audit

## Direct lookup operations: 5

1. Cached channel name lookup in `findChannelByName`.
2. Cached category name lookup in `getOrCreateCategory`.
3. Cached role name lookup in `maybeAddRole`.
4. Cached guide-channel ID lookup in `sendConciergeWelcome`.
5. Guide-channel fetch fallback in `sendConciergeWelcome`.

## Direct mutation/delivery operations: 12 static call sites

- Three `guild.channels.create` sites.
- One `channel.setParent` site.
- One `permissionOverwrites.set` site.
- One `member.roles.add` site.
- Five `interaction.reply` sites in button handling.
- One `member.send` site for welcome delivery.

Guide and Roadmap message edit/send operations are deliberately excluded from
the direct count: those calls use their existing mutation ports. This audit
freezes, rather than changes, the remaining direct Runtime Discord surface.
