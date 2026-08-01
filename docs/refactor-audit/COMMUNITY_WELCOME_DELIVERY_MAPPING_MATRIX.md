# Community Welcome Delivery Mapping Matrix

| Legacy value | Application candidate | Current owner | Integrated |
| --- | --- | --- | --- |
| `member.guild.id` | request `guildId` | runtime | No |
| resolved `guideChannel.id` | request `guideChannelId` | runtime lookup | No |
| `member.guild.name` | pure builder template context, not request | runtime | No |
| URL/content | `buildCommunityWelcomeMessage` payload | runtime template | No |
| `member.send({ content })` | future delivery adapter concern | runtime | No |
| send success/rejection | future result vocabulary | runtime catch | No |
| missing destination | future skipped reason | runtime early return | No |
| JSON/persistence/repeated invocation | excluded | runtime / none | No |

The mapper accepts only already-resolved `{ guildId, guideChannelId }`; it does not read onboarding records, lookup channels, fetch Discord objects, send DMs, or persist data.
