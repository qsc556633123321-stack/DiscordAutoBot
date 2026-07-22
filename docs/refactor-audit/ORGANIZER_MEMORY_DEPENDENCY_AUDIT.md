# Organizer Memory Dependency Audit

## Before Phase 6

The active `src/systems/organizer.js` facade re-exported `src/legacy/systemRuntimes/organizerRuntime.js`. That legacy runtime directly imported `src/systems/serverMemory.js` and called `listChannelRules(guildId)` while creating an auto-organize plan.

## Consumer Behavior Preserved

- Query by guild ID before scoring channels.
- Use every rule, rather than the `/memory-list` presentation limit of 25.
- Preserve raw keyword, category, and weight values for scoring.
- On reader failure, log and continue with an empty rule list.
- Preserve the existing keyword normalization and score explanation text.

## After Phase 6

```text
systems/organizer facade
  -> composition/organizerFeature
  -> application/organizer/createOrganizerPlanningUseCase
  -> channelRuleReader port
  -> memoryFeature.getChannelRulesForOrganizer
  -> JSON channel-rule repository
```

The active organizer path has no direct `serverMemory.js`, JSON repository, filesystem, Discord API, or legacy import. `src/legacy/systemRuntimes/organizerRuntime.js` and `src/systems/serverMemory.js` remain untouched as rollback-compatible source, but are no longer active organizer consumers.

## Risk and Fallback

The reader failure fallback is intentionally preserved: organizer planning proceeds without memory score bonuses. No cache, mutation, JSON-shape change, Discord output change, AI prompt change, channel mapping change, or command behavior change is part of this migration.
