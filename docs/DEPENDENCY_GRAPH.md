# Dependency Graph

Generated: 2026-06-27T13:47:32.146Z

## Summary

- JS files scanned: 220
- Local dependency edges: 390
- Circular dependencies: 0
- Service chain max depth: 2
- Service chains over two layers: 0
- Active command direct Discord API usage: 0
- Legacy command direct Discord API usage: 2
- Architecture score: 80 / 100

## Architecture Rules

Allowed direction:

```
Command -> Service -> Domain -> Repository -> Infrastructure
```

Reverse dependencies are flagged when a lower layer imports upward. Legacy relationships are included when they still affect the active compatibility path.

## Circular Dependencies

None.

## Service Chains Over Two Layers

None.

## Command Direct Discord API Usage

- src/legacy/commands/setupServerLegacy.js: \bguild\.channels\.create\b, \bguild\.roles\.create\b
- src/legacy/commands/setupTicketLegacy.js: \bguild\.channels\.create\b

## Service Direct JSON Access

None.

## Domain Depends On Infrastructure

None.

## Reverse Layer Dependencies

- src/modules/layout/layoutPermissionPolicy.js (other) -> src/services/community/communityPermissionService.js (service)
- src/modules/layout/rules/duplicateGameRule.js (other) -> src/domain/games/gameIdentityService.js (domain)
- src/services/community/communityService.js (service) -> src/legacy/commands/analyze_server.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/ai_reorganize_server.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/auto_organize.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/deep_cleanup.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/plan_cleanup.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/rebuild_server.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/setupServerLegacy.js (command)
- src/services/community/communityService.js (service) -> src/legacy/commands/setupTicketLegacy.js (command)

## Architecture Score

Score: 80 / 100

Penalty model:

- Circular dependency: -8 each
- Service chain over two layers: -5 each
- Active command direct Discord API usage: -4 each
- Legacy command direct Discord API usage: tracked in burn-down, not active score
- Service direct JSON access: -4 each
- Domain depends on infrastructure: -8 each
- Reverse layer dependency: -2 each

## Top 10 Refactor Candidates

1. Command directly uses Discord API: `src/legacy/commands/setupServerLegacy.js`
2. Command directly uses Discord API: `src/legacy/commands/setupTicketLegacy.js`
3. High dependency count: `src/legacy/interactions/legacyInteractionRuntime.js`
4. High dependency count: `src/services/community/communityService.js`
5. High dependency count: `src/systems/communityV3Builder.js`
6. High dependency count: `src/legacy/community/serverRebuilder.js`
7. High dependency count: `src/legacy/layout/legacyLayoutRuntime.js`
8. High dependency count: `src/services/community/communityPermissionService.js`
9. High dependency count: `src/legacy/community/communityBootstrapSystem.js`
10. High dependency count: `src/legacy/deprecated/services/community/legacyAnalysisCommandService.js`

## Top 10 Dependency Count

1. `src/legacy/interactions/legacyInteractionRuntime.js` - 26 local deps, 2066 lines
2. `src/services/community/communityService.js` - 11 local deps, 35 lines
3. `src/systems/communityV3Builder.js` - 10 local deps, 513 lines
4. `src/legacy/community/serverRebuilder.js` - 8 local deps, 365 lines
5. `src/legacy/layout/legacyLayoutRuntime.js` - 8 local deps, 1058 lines
6. `src/services/community/communityPermissionService.js` - 8 local deps, 316 lines
7. `src/legacy/community/communityBootstrapSystem.js` - 7 local deps, 814 lines
8. `src/legacy/deprecated/services/community/legacyAnalysisCommandService.js` - 7 local deps, 22 lines
9. `src/systems/gameSuggestionSystem.js` - 7 local deps, 626 lines
10. `src/events/voiceStateUpdate.js` - 6 local deps, 155 lines

## Fattest Services

1. `src/services/community/communityPermissionService.js` - 316 lines, 8 local deps
2. `src/services/community/communityRebuildService.js` - 74 lines, 5 local deps
3. `src/services/games/gameCategoryService.js` - 38 lines, 4 local deps
4. `src/services/community/communityService.js` - 35 lines, 11 local deps
5. `src/services/security/securityDecisionService.js` - 10 lines, 1 local deps
6. `src/services/security/linkGuardService.js` - 2 lines, 1 local deps
7. `src/services/security/memberGuardService.js` - 2 lines, 1 local deps
8. `src/services/voice/voiceHubService.js` - 2 lines, 1 local deps

## Largest Files By Role

- Service: `src/services/community/communityPermissionService.js` (316 lines)
- Command: `src/legacy/commands/setupServerLegacy.js` (300 lines)
- Event: `src/events/voiceStateUpdate.js` (155 lines)
- Router: `src/modules/commands/commandRouter.js` (82 lines)
- Util: `src/utils/voiceStats.js` (106 lines)

## Type Counts

- adapter: 3
- command: 80
- config: 13
- core: 3
- domain: 6
- event: 6
- legacy: 18
- other: 32
- repository: 3
- router: 3
- service: 8
- system: 42
- util: 3

## Graph Artifact

Full machine-readable graph: `dependency-graph.json`
