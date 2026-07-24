# Community Remaining Migration Plan

## Selection result

After completing the full boundary, side-effect, dependency, risk, and test analysis, the single recommended next slice remains **Help-me-start recommendation**. It is the only active remaining Community entry with no Discord mutation, no JSON write, no role change, and no Layout/Permission Repair/MemberGuard execution dependency.

| Phase | Scope / entry | Current runtime path | Target path | Dependencies / exclusions | Tests | Risk / blocker | Definition of done |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/help-me-start` only | legacy command -> `interactiveGuideSystem.buildHelpMeStartEmbed` -> optional Concierge AI text -> reply | presentation command -> query use case -> recommendation policy/renderer -> guild channel read + optional AI text port -> composition; legacy thin wrapper | Exclude Guide publishing/buttons, role mutation, event onboarding, panels, JSON writes, registry changes | exact embed, option mapping, channel pattern, AI success/failure, command/reply migration regression | Low; must preserve optional-AI fallback wording | same Slash metadata, payload, error/reply behavior, wrapper retained, quality/dashboard pass |
| 2 | Guide payload read/renderer | Concierge helpers | **Complete:** focused payload composition and compatibility delegation | status, `getOrCreate`, publication, roles remain excluded | content/Embed/component fixtures | Medium; interaction fallback | no mutation path changes |
| 3 | Panel payload renderer | channel panel runtime `buildPanel` | pure presentation module | Exclude publishing and custom-ID dispatch change | custom-ID/payload fixtures | Medium | no runtime routing change until wrapper migration |
| 4 | Roles read queries | role manager helpers | focused read composition | Exclude mutation/inheritance | role options/state settings fixtures | Medium | read-only only |
| 5 | Any mutation | deferred | separate plan | must select one mutation boundary | targeted tests first | blocked according to risk matrix | not authorized by this document |

All later rows are planning placeholders, not authorization to begin another slice. The migration sequence stops after Phase 1 until a new explicit request.
