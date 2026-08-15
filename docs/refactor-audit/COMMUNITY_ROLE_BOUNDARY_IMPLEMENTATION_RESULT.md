# Community Role Boundary Implementation Result

Role intent mapping is now Application-owned by
`CommunityRoleQuickActionUseCase`. It accepts the plain request
`{ guildId, memberId, action }`, supports `games`, `invest`, and `dev`, and
returns frozen `{ added, action, roleName }` results.

`CommunityRoleMutationGateway` is the Infrastructure owner of exact-name role
cache lookup, Manage Roles and hierarchy checks, and `member.roles.add`. It
preserves the legacy fixed reason, add-only operation, repeated add behavior,
and swallowed Discord rejection that reports `added: true`.

`handleConciergeButton` remains the Runtime presentation wrapper: customId
routing, embeds, ephemeral `interaction.reply`, non-role buttons, and legacy
dispatcher behavior remain in place. Direct Runtime role cache lookup and
`member.roles.add` are removed.
