# Community Proposals Boundary Discovery

## Lifecycle

```text
/suggest-game or panel_suggest_game
  -> create suggestion modal / slash input
  -> createGameSuggestion
  -> game-suggestions.json + proposal message
  -> support / oppose votes
  -> admin approve or reject
  -> on approval: createDynamicGameCategory
  -> game-categories.json, game channels, overwrites, Temp Voice create entry
  -> panel refresh, Voice Hub schedule, LFG/Voice integration, server log
```

| Concern | Current state | Classification |
| --- | --- | --- |
| Command/modal/card/voting | Active runtime through suggestion system | Active Feature |
| Suggestion model | `game-suggestions.json` with ID, proposer, reason, vote/review state and message location | Independent data model |
| Game category model | `game-categories.json` with identity/display/channel IDs | Independent data model |
| Approve/reject policy | Button handlers enforce admin review, duplicate game detection and rejection reason modal | Existing policy, intertwined with Discord runtime |
| Game creation | category/channel create, canonical rename/move and overwrites | Games / Layout mutation |
| Temp Voice | create-entry registration and Voice Hub update scheduling | Voice integration |
| LFG | created game area is expected to work with existing LFG/voice infrastructure | Voice integration |
| Panel refresh | proposal approval refreshes panels | Panels integration |
| Roadmap | no Roadmap JSON write or Roadmap state update found | No direct dependency |
| Archive inactive games | same runtime contains activity scan and moves dynamic games | Separate maintenance sub-feature |

## Boundary verdict

- Proposal has an independent lifecycle, explicit persisted models, stateful review actions, and its own user-visible card.
- It mutates Games, Layout, Permissions, Voice entry metadata, Panels, and logs. It is therefore not a small Community mutation.
- It should move out of broad Community ownership into a **Game Proposals** bounded context, adjacent to Games rather than Voice.
- Community should retain only a narrow integration boundary: a proposal-navigation panel/link and a request/result contract for publishing a Community-facing proposal entry. Community must not create game categories, register Temp Voice entries, or schedule Voice Hub updates directly.
- No part is a removal candidate; the feature is active. Read-only `ListPendingSuggestions` / `GetSuggestionStatus` are possible future query candidates, while submit, vote, review, approval, and archive remain mutation/orchestration work.
