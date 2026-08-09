# Community Roadmap Adapter Pair Preparation Blockers

## Base

- Commit: `9dc7fc0 feat: add community roadmap lookup adapter`
- Roadmap Resource Session, Lookup Port, and Lookup Adapter are implemented but
  intentionally not wired to runtime.

## Resolved by this preparation slice

- The pair name is `RoadmapPublicationAdapterPair`; it makes publication scope
  clear without pretending to be a generic cross-feature abstraction.
- Factory input is only `{ ensuredChannel }`.
- The factory owns exactly one fresh Resource Session and exactly one Lookup
  Adapter per future invocation.
- The pair public surface is limited to `lookupPort` and
  `getRetainedMessage`.

## Still blocked

- No production pair factory exists yet.
- No Roadmap composition feature exists.
- The legacy Concierge runtime still performs Roadmap lookup.
- Roadmap mutation remains outside this boundary.
