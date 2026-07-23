# Community Remaining Slice Discovery Baseline

## Scope and guardrail

This is a documentation-only discovery pass for Community features that remain after the completed `/community-about` and `/community-roadmap` read slices. It does not change runtime code, command registration, aliases, Discord objects, JSON contracts, Dashboard code, or environment configuration.

## Repository baseline

| Item | Value |
| --- | --- |
| Branch | `main` |
| Starting commit | `55201b1 refactor: remove unused community roadmap progress` |
| Starting working tree | Clean |
| Completed Community read slices | `/community-about`, `/community-roadmap` |
| Legacy inventory baseline | 100 legacy files |
| Main commands / aliases | 7 grouped commands / 65 aliases |
| Architecture score | 100 / 100 |
| Circular dependencies | 0 |

## Existing migration status

| Area | Status | Notes |
| --- | --- | --- |
| Community About | Migrated read slice; thin wrapper retained | Do not revisit in this pass. |
| Community Roadmap | Migrated read slice; thin wrapper retained | Formal JSON and legacy fallback contract remain unchanged. |
| Onboarding visibility | Migrated read slice with compatibility gateway | Still delegates native inspection to legacy bootstrap code. |
| Guide and Concierge | Discovery only | Mixes content, OpenAI wording, Discord reads, JSON persistence, messages, role mutations, and DM. |
| Roles and Guest Gate | Discovery only | Crosses MemberGuard and permission repair boundaries. |
| Panels | Discovery only | Active runtime owns message lifecycle and `channel-panels.json`. |
| Game proposals | Discovery only | Crosses Games, Voice, LFG, Voice Hub, panels, and permissions. |
| Bootstrap / rebuild / maintenance | Discovery only | High-risk orchestration with categories, channels, roles, overwrites, and plan state. |

## Runtime and data baseline

| Kind | Current locations | Notes |
| --- | --- | --- |
| Command registry | `src/modules/commands/commandRegistry.js`, `commandRouter.js`, `aliasRegistry.js` | Aliases are dynamically loaded from `src/legacy/commands`; static absence is not proof of inactivity. |
| Event entrypoints | `src/index.js`, `src/events/guildMemberAdd.js`, interaction modules | Guide welcome executes after MemberGuard and Welcome System in the member-add path. |
| Guide / onboarding | `src/systems/communityConcierge.js`, `interactiveGuideSystem.js`, `welcomeSystem.js` | `onboarding-flows.json` and `welcome-settings.json` are active contracts. |
| Role operations | `src/legacy/systemRuntimes/roleManagerRuntime.js`, `src/services/community/communityPermissionService.js` | `role-settings.json`; role inheritance is shared with Guest Gate / MemberGuard expectations. |
| Panel operations | `src/legacy/systemRuntimes/channelPanelsRuntime.js` | `channel-panels.json`; custom IDs flow through the interaction fallback. |
| Proposal operations | `src/legacy/systemRuntimes/gameSuggestionSystemRuntime.js` | `game-suggestions.json`, `game-categories.json`, Temp Voice create-entry metadata. |
| Maintenance | legacy community/bootstrap/rebuild/polisher runtimes plus Community services | Plan JSON contracts include layout / architect / registry files. |

## Verification baseline

| Command | Result | Notes |
| --- | --- | --- |
| `npm run test:community` | Pass | About and Roadmap vertical-slice suites passed. |
| `npm run test:audit` | Pass | Audit vertical slice passed. |
| `npm run test:memberguard` | Pass | Existing MemberGuard suite passed. |
| `npm run test:memberguard-mutations` | Pass | Existing mutation suite passed. |
| `npm run test:memory` | Pass | Existing Memory suite passed. |
| `npm run test:organizer` | Pass | Existing Organizer suite passed. |
| `npm run test:migration` | Pass | Existing migration regressions passed. |
| `npm run test:legacy-audit` | Pass | Existing legacy-audit tests passed. |
| `npm run test:architecture` | Pass | Architecture invariants passed. |
| `npm run test:legacy-boundaries` | Pass | Approved compatibility boundary checks passed. |
| `npm run quality:gate` | Pass | Score remained 100 / 100; circular dependencies remained 0. |
| `npm run audit:legacy` | Pass | Generated inventory output was restored because it only changed generated timestamps and misclassified completed wrappers. |
| `npm run dashboard:build` | Pass on retry | First run hit known Windows `spawn EPERM` after compilation; unchanged retry passed. |

## Discovery conclusion

The remaining Community surface is not one feature. It contains three separable read paths (guide content, guide status, onboarding inspection), several independent mutation workflows (guide publication, role assignment, panel publishing, proposal review), and high-risk orchestration (bootstrap, rebuild, repair, maintenance). The next migration must select one bounded capability only and retain the legacy path as a compatibility wrapper.
