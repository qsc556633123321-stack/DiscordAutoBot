# Community Guide Discord Mutation Resource Identity

## Identity Inventory

| Resource | Edit requirement | Send requirement | Runtime owner today | Future port input | Missing/malformed behavior |
| --- | --- | --- | --- | --- | --- |
| `guildId` | required for audit/context | required for audit/context | `guild.id` | required | runtime currently has it; no port behavior yet |
| `channelId` | required target context | required send destination | `channel.id` | required | channel is ensured before this boundary |
| `messageId` | required target identity | absent | stored guide ID / fetched message | required for edit only | truthy malformed legacy ID is fetched; rejection becomes `null` and branch sends |
| Discord Message | calls `.edit()` | not used | legacy runtime | forbidden | no object should cross Application boundary |
| Discord Channel | lookup context | calls `.send()` | legacy runtime | forbidden | no object should cross Application boundary |
| operation | Edit | Send | Application Plan | required | unsupported operation currently throws in runtime |
| payload | required | required | Guide payload builder | required | runtime propagates payload/build errors |

## Identity Rules for a Future Port

- Edit requests require `guildId`, `channelId`, `messageId`, and `payload`.
- Send requests require `guildId`, `channelId`, and `payload`.
- IDs are scalar opaque values; they are not normalized, validated, or repaired
  in this preparation slice.
- Discord resource objects remain infrastructure-local after a future adapter
  performs lookup.
- The port should return scalar result data only, including `messageId` when
  available.

## Current Compatibility Constraint

The legacy runtime fetches every truthy tracked ID unless `mode === 'force'`.
Any future migration must preserve that lookup timing, fetch count, catch to
`null`, and consequent Send branch. This preparation does not define a new
normalization policy.
