# Dependency Graph

Generated: 2026-07-22T17:00:42.790Z

## Summary

- JS files scanned: 278
- Local dependency edges: 450
- Circular dependencies: 0
- Service chain max depth: 2
- Service chains over two layers: 0
- Active command direct Discord API usage: 0
- Legacy command direct Discord API usage: 2
- Active JS files over 400 lines: 0
- Command files over 150 lines: 0
- Event files over 80 lines: 0
- Hard architecture failures: 0
- Architecture score: 100 / 100

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

## Service Direct Discord API Usage

None.

## Service Imports Command/Event

None.

## Domain Depends On Infrastructure

None.

## Legacy Imports Without fallbackAllowed

None.

## Reverse Layer Dependencies

None.

## Hard Architecture Failures

None.

## Architecture Score

Score: 100 / 100

Penalty model:

- Circular dependency: -8 each
- Service chain over two layers: -5 each
- Active command direct Discord API usage: -4 each
- Legacy command direct Discord API usage: tracked in burn-down, not active score
- Service direct JSON access: -4 each
- Service direct Discord API usage: -6 each
- Service imports command/event: -6 each
- Active import of legacy without fallbackAllowed: -4 each
- Domain depends on infrastructure: -8 each
- Reverse layer dependency: -2 each

## Top 10 Refactor Candidates

1. Command directly uses Discord API: `src/legacy/commands/setupServerLegacy.js`
2. Command directly uses Discord API: `src/legacy/commands/setupTicketLegacy.js`
3. High dependency count: `src/legacy/interactions/legacyInteractionRuntime.js`
4. High dependency count: `src/composition/memberGuardFeature.js`
5. High dependency count: `src/legacy/systemRuntimes/communityV3BuilderRuntime.js`
6. High dependency count: `src/legacy/community/serverRebuilder.js`
7. High dependency count: `src/legacy/layout/legacyLayoutRuntime.js`
8. High dependency count: `src/services/community/communityPermissionService.js`
9. High dependency count: `src/adapters/legacy/legacyCommunityCommandExecutor.js`
10. High dependency count: `src/legacy/community/communityBootstrapSystem.js`

## Top 10 Dependency Count

1. `src/legacy/interactions/legacyInteractionRuntime.js` - 26 local deps, 2066 lines
2. `src/composition/memberGuardFeature.js` - 10 local deps, 38 lines
3. `src/legacy/systemRuntimes/communityV3BuilderRuntime.js` - 10 local deps, 513 lines
4. `src/legacy/community/serverRebuilder.js` - 8 local deps, 365 lines
5. `src/legacy/layout/legacyLayoutRuntime.js` - 8 local deps, 1058 lines
6. `src/services/community/communityPermissionService.js` - 8 local deps, 317 lines
7. `src/adapters/legacy/legacyCommunityCommandExecutor.js` - 7 local deps, 24 lines
8. `src/legacy/community/communityBootstrapSystem.js` - 7 local deps, 814 lines
9. `src/legacy/deprecated/services/community/legacyAnalysisCommandService.js` - 7 local deps, 22 lines
10. `src/legacy/systemRuntimes/gameSuggestionSystemRuntime.js` - 7 local deps, 626 lines

## Fattest Services

1. `src/services/community/communityPermissionService.js` - 317 lines, 8 local deps
2. `src/services/community/communityRebuildService.js` - 75 lines, 5 local deps
3. `src/services/games/gameCategoryService.js` - 39 lines, 4 local deps
4. `src/services/community/communityService.js` - 21 lines, 3 local deps
5. `src/services/security/securityDecisionService.js` - 10 lines, 1 local deps
6. `src/services/security/memberGuardService.js` - 5 lines, 1 local deps
7. `src/services/security/linkGuardService.js` - 2 lines, 1 local deps
8. `src/services/voice/voiceHubService.js` - 2 lines, 1 local deps

## Largest Files By Role

- Service: `src/services/community/communityPermissionService.js` (317 lines)
- Command: `src/legacy/commands/setupServerLegacy.js` (300 lines)
- Event: `src/modules/events/voiceStateUpdateGateway.js` (155 lines)
- Router: `src/modules/commands/commandRouter.js` (82 lines)
- Util: `src/utils/voiceStats.js` (106 lines)

## Type Counts

- adapter: 5
- application: 20
- command: 80
- composition: 4
- config: 14
- core: 3
- domain: 12
- event: 7
- infrastructure: 5
- legacy: 27
- other: 3
- presentation: 8
- repository: 5
- router: 17
- service: 8
- system: 57
- util: 3

## Graph Artifact

Full machine-readable graph: `dependency-graph.json`
