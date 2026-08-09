# Community Roadmap Lookup Port Implementation Readiness

## Current state

- Roadmap Resource Session: implemented, not wired.
- Roadmap lookup port: prepared through test-only contract/fake coverage.
- Roadmap lookup adapter: not implemented.
- Roadmap runtime lookup: legacy-owned.

## Approved next slice

Implement a production `RoadmapPublicationMessageLookupPort` only, without an
adapter, composition feature, or runtime redirect. The contract is semantically
clear, application-pure, preserves falsy-ID and rejection behavior through the
session, and has frozen no-extra-I/O and identity-handoff coverage.

## Explicitly not approved

Do not implement a Roadmap adapter, pair, runtime lookup redirect, mutation
surface, or generic publication lookup port in the next slice.
