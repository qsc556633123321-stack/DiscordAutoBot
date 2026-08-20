Game Role Preview Command Pattern Audit
Selected namespace: /admin game-role-preview.
This is a route-only handler, not a new top-level alias.
Authorization: existing interaction guard plus PermissionFlagsBits.Administrator.
Presentation: gameRoleProvisioningPreviewRenderer returns chunked Embed payloads.
Registration: commandRouter maps admin/game-role-preview; commandRegistry uses route targets only.
Safety: command calls previewGameRoleProvisioning only and has no mutation or startup path.
