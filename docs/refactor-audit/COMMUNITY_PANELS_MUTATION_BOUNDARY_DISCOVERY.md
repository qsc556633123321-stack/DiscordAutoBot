# Community Panels Mutation Boundary Discovery

## Scope

Persistent per-channel panel setup, refresh, force replacement, tracking and
stale-record removal. Button behavior itself belongs to its owning feature.

## Active Runtime Entries

- `src/legacy/commands/setup-channel-panels.js` -> `execute` ->
  `/setup-channel-panels` with `create`, `refresh` or `force`.
- Bootstrap, V3 rebuild and accepted game proposals call panel refresh as a
  secondary operation.

## Runtime Call Paths

`src/legacy/commands/setup-channel-panels.js` -> `execute` ->
`src/systems/channelPanels.js:setupChannelPanels` -> target resolver ->
tracked-message fetch -> `message.edit` / `channel.send` / tracked
`message.delete` -> `src/data/channel-panels.json`.

`src/legacy/systemRuntimes/gameSuggestionSystemRuntime.js` ->
`approveSuggestion` -> `setupChannelPanels({ mode: 'refresh', target: 'game' })`
-> panel message/data mutation.

## Read Operations

Guild channels, panel type detection, current command target, tracked panel
records, and existing tracked message IDs.

## Mutation Operations

Atomic operations P01-P09 in the operation matrix: target lookup, record load,
message fetch, payload build, edit/send/delete, record persistence and stale
record removal.

## Data Sources

`src/data/channel-panels.json`, channel names/category context, and the panel
payload builders in `src/systems/channelPanels.js`.

## Persisted Records

Per guild/channel: tracked `messageId`, `panelType`, and `updatedAt`.

## Discord Objects Used

Guild text channels, bot-authored messages, embeds, action rows and buttons.

## Authorization

The slash command enforces its configured management permission. `force` is
limited by runtime checks to messages tracked in the panel record and sent by
the bot; it is never intended to delete arbitrary channel messages.

## Error Handling

Per-channel results are summarized. Missing messages become stale-record
candidates; send/edit/delete and JSON errors are caught rather than stopping all
target channels where the runtime can continue.

## Retry Behavior

No dedicated panel retry queue was found. Re-running refresh is the operational
retry and can repair a stale record.

## Idempotency

Channel ID plus panel type/record is the key. `create` avoids a valid tracked
message, `refresh` edits when possible, and `force` intentionally replaces only
the tracked bot message.

## Partial Failure Windows

- panel message sent before its ID is persisted;
- force deletes the old message before replacement send;
- record removed while Discord message still exists after a fetch mismatch.

## Shared Legacy Helpers

JSON reader/writer helpers, channel-panel type resolution, ticket and Temp Voice
button payload helpers.

## Cross-feature Dependencies

Roles panel uses role setup/select, ticket panel delegates to ticket runtime,
voice panel delegates to Temp Voice, game proposal approval refreshes game
panels, and rebuild/bootstrapping refresh panels after layout mutations.

## Existing Tests

Architecture and legacy boundary tests cover routing and source boundaries.
There is no focused record/message lifecycle baseline test.

## Missing Baseline Tests

- create versus refresh versus force against a fake tracked bot message;
- stale tracked message cleanup;
- refusal to delete an untracked/non-bot message;
- send success followed by record-write failure.

## Candidate Slice Boundaries

Panel publisher service plus panel-record repository, keeping payload generation
and individual button consumers outside the first mutation slice.

## Explicitly Excluded Responsibilities

Ticket creation, role assignment, Temp Voice creation, proposal approval,
permission layout and any channel creation are excluded.

## Blockers

The panel runtime owns direct JSON and Discord calls and has broad dependencies
on feature-specific payload/button behavior.

## Recommended Status

Discovery complete; high fan-out mutation slice, so migrate only after Guide
mutation has established repository/message writer patterns.
