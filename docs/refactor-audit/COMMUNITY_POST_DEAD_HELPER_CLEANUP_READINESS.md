# Community Post Dead Helper Cleanup Readiness

## Decision
Candidate A: Publication Persistence Path Boundary Preparation.

The remaining runtime path constants are shared by JsonReader construction and
Guide/Roadmap publication persistence. Moving them now requires a persistence
path boundary decision; a default JsonReader factory alone would leave that
shared ownership unresolved.

Candidates B-F are deferred: default factory implementation alone, role,
button, channel setup, and AI boundaries do not resolve the current path
ownership blocker.
