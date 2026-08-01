# Community Mutation Side Effect Matrix

| Function | Discord API | Filesystem / JSON | Memory | Domain / application | Logs / timers / environment |
| --- | --- | --- | --- | --- | --- |
| `setupCommunityGuide` | Direct create/move/overwrite/fetch/edit/send | Indirect via `saveOnboarding` | None | reads Guide payload composition | errors propagate except overwrite catch; no timer/environment |
| `setupRoadmapPanel` | Direct create/fetch/edit/send | Indirect via `saveOnboarding` | None | reads Roadmap feature | errors propagate; no timer/environment |
| `saveOnboarding` | None | Direct read/whole-root write | None | None | write helper logs failure; no retry |
| `writeJson` | None | Direct synchronous write | None | None | catches/logs failure; no retry |

No mutation function has a domain transaction, application use case, or rollback primitive today.
