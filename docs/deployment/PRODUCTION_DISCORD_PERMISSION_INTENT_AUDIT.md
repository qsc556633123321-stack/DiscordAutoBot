# Production Discord Permission and Intent Audit

## Gateway Intents

`src/index.js` creates the Bot client with `Guilds`, `GuildMembers`,
`GuildMessages`, `MessageContent`, and `GuildVoiceStates`; it also enables the
`Channel` partial. `GuildMembers` and `MessageContent` are privileged intents
and must be enabled for the application in the Discord Developer Portal before
the refactored Bot replaces production.

## Permissions Evidenced By Active Features

The Bot requires a role whose channel scope covers the managed server and whose
permissions support the enabled features:

- View Channel, Send Messages, Embed Links, Read Message History.
- Manage Channels and Manage Roles for community setup, permissions, and role
  workflows.
- Manage Messages for active moderation/guard features.
- Connect and Speak for Voice features.

Command-level `ManageGuild`, `ManageChannels`, `ManageRoles`, and
`ManageMessages` checks are also present for human operators. `Manage Webhooks`
is not evidenced by this audit and is not requested here.

## Manual Verification

Verify the installed Bot role position is above roles it must grant, and test
permissions in the intended production guild after deployment. This audit does
not inspect the live guild.
