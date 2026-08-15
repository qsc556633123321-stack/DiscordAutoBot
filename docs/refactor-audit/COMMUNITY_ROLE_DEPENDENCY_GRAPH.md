# Community Role Dependency Graph

```text
legacyInteractionRuntime concierge_* branch
  -> handleConciergeButton(interaction)
    -> customId-to-role intent (Runtime)
    -> maybeAddRole(member, roleName) (Runtime)
      -> guild/member/role cache and hierarchy checks (Discord)
      -> member.roles.add (Discord mutation)
    -> interaction.reply ephemeral embed (Discord presentation)
```

Role intent, lookup, mutation, and presentation are coupled in the same
runtime module. Button routing is a separate legacy dispatcher concern, but the
`concierge_*` branch currently catches errors around the whole handler.
