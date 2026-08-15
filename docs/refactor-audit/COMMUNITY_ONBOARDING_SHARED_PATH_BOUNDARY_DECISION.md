# Community Onboarding Shared Path Boundary Decision

## Decision: SEPARATE
Persistence can adopt the existing adapter defaults in a two-call runtime change. JsonReader still needs its own default-factory or path-boundary slice. Combining them would redirect five constructions across three closed flows and would hide independent read-side side effects (missing-file creation, fallback, and logging) behind the persistence change.

The two boundaries retain exact path identity but are intentionally sequenced separately. StateReader and tracking adapters remain path-free.
