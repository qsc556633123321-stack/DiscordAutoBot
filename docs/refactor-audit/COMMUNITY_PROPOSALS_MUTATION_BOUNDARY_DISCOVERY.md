# Community Proposals Mutation Boundary Discovery

## Scope

Game suggestion form, suggestion card lifecycle, voting, approval/rejection,
dynamic game category creation and inactive-game archival. It includes only the
runtime currently reached through proposal customIds and commands.

## Active Runtime Entries

- `game_suggest_create_modal` modal submit.
- `game_suggest_support_*` button.
- `game_suggest_oppose_*` button.
- `game_suggest_approve_*` button.
- `game_suggest_reject_*` button, which opens a modal.
- `game_suggest_reject_modal_*` modal submit.
- `/suggest-game` legacy command where dynamically registered.
- `/archive-inactive-games` -> `archiveInactiveGames`.

## Runtime Call Paths

`interactionGateway` -> `modalInteractionHandler` -> legacy interaction runtime
-> `handleCreateSuggestionModal` -> `createGameSuggestion` ->
`getOrCreateGameSuggestionChannel` -> `channel.send` -> `saveSuggestion` ->
`game-suggestions.json` mutation.

`buttonInteractionHandler` -> `gameButtons.handle` -> legacy interaction runtime
-> `handleGameSuggestionButton` -> `approveSuggestion` ->
`createDynamicGameCategory` -> category/child `guild.channels.create`, overwrite
write, create-entry registration and game-category metadata mutation.

`buttonInteractionHandler` -> `gameButtons.handle` -> `showRejectModal` ->
`game_suggest_reject_modal_*` -> `rejectSuggestion` -> `saveSuggestion` ->
`updateSuggestionMessage` -> message edit and server log send.

## Read Operations

Suggestion and game-category JSON, current guild category/channel caches,
existing game identity/category lookup, member permission, message activity and
active Temp Voice status for archival.

## Mutation Operations

Q01-Q12 in the operation matrix: locate/create suggestion channel; persist/send
proposal; vote arrays/card edits; approval status; dynamic game structure,
create-entry metadata, panel refresh; rejection status/card/log update.

## Data Sources

`game-suggestions.json`, `game-categories.json`, game registry/identity service,
community structure helpers, Temp Voice create-entry metadata and panel records.

## Persisted Records

Suggestion fields including status, supporters/opposers, requester, card/channel
IDs, approver/rejector timestamps/reason; dynamic game category and create-entry
metadata.

## Discord Objects Used

Suggestion text channel/message/buttons/modals, game category, game child text
and voice-create channels, permission overwrites, server-log channel.

## Authorization

Any member can create/vote subject to runtime checks. Approval/rejection require
`ManageChannels`; the dynamic build also depends on bot channel/overwrite
permissions.

## Error Handling

Modal creation defers then edits failure. Approval/rejection and message updates
use local catches or dispatcher-level handling; panel/log refreshes are explicitly
best effort in some paths.

## Retry Behavior

Dynamic game creation uses a per-step delay. No transaction retries the whole
approval after a partial build; inactive archive moves also delay operations.

## Idempotency

Suggestion ID and pending status guard votes/approval/rejection. Game identity
lookup prevents a duplicate category where aliases resolve correctly. Metadata
and Discord structure can still diverge if a later write fails.

## Partial Failure Windows

- pending suggestion record written before its card sends;
- vote JSON updates before card edit;
- approval status saved before dynamic category creation completes;
- category/first child created before remaining children/metadata;
- category created but create-entry registration or panel refresh fails;
- archive move occurs before metadata update.

## Shared Legacy Helpers

`gameSuggestionSystemRuntime`, `communityStructureManager`, `gameChannels`,
`channelPanels`, `voiceHub`, `serverLogs`, persona message helpers and direct
legacy JSON helpers.

## Cross-feature Dependencies

Game identity/registry, Community structure, permission sync, Temp Voice entry
registration, Voice Hub, LFG, panel refresh, server logs and archive categories.

## Existing Tests

Architecture/legacy boundary tests cover dispatcher routing. Game identity tests
cover aliases. No end-to-end fake guild proposal approval baseline exists.

## Missing Baseline Tests

- card send/persist ordering;
- vote toggling and duplicate voter idempotency;
- existing game alias approval branch;
- partial dynamic category build and retry/re-run behavior;
- reject modal authorization and reason persistence;
- inactive-game eligibility with active Temp Voice.

## Candidate Slice Boundaries

Start with proposal record/card mutation, then separately migrate approval into a
game-category application workflow. Do not include Voice Hub/LFG side effects in
the first proposal slice.

## Explicitly Excluded Responsibilities

Game read models, game registry content policy, Voice Hub rendering, LFG joining,
community layout broad rebuild and AI text generation are excluded.

## Blockers

This runtime imports numerous legacy systems and performs direct JSON/Discord
writes. Approval has the largest cross-feature fan-out in the Community set.

## Recommended Status

Discovery complete; blocked/high-risk. It should not precede Guide, Panel and
game-category repository extraction.
