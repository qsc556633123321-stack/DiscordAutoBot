# Community Role Existing Pattern Audit

The closest existing mutation pattern is MemberGuard:

- Application use cases accept scalar IDs and return plain result objects.
- `src/infrastructure/discord/memberRoleGateway.js` resolves guild/member
  runtime objects internally and owns `member.roles.add/remove`.
- Composition supplies a `resolveGuild` dependency.

Community quick actions differ because their current owner receives live
Discord interaction/member objects and owns presentation. A future migration
should use a plain action request plus a narrow role mutation gateway; Domain
should not import Discord.js and Application should not accept GuildMember or
Role objects.
