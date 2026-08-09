# DiscordAutoBot Refactor Status

## Current Phase
Guide Send Message Identity Handoff Preparation

## Overall Progress
Estimated local refactor progress: 65%

## Latest Completed
- Project Architecture V2 established
- Migration framework established
- Architecture guardrails established
- Community read-only migration mostly completed
- Shared publication state contract characterized
- Guide publication baseline completed
- Guide publication plan builder completed
- Guide execution characterization completed
- Guide runtime integration started
- Guide publication persistence writer/repository migrated through application,
  infrastructure, and composition layers
- Execution Request runtime preparation deferred pending an explicit baseline
  decision
- Execution Request reassessed after persistence migration; runtime integration
  rejected and Guide-specific Discord mutation port preparation selected next
- Guide-specific Discord mutation identity, lookup, result, failure, and
  compatibility contracts prepared without a runtime redirect
- Guide-specific Application Port interface, immutable request/result contracts,
  failure vocabulary, and test adapter implemented without wiring
- Guide-specific Infrastructure Adapter boundary characterized with a test-only
  resource harness; no production adapter implemented
- Guide pre-Plan tracked-message lookup timing, force behavior, malformed-ID
  behavior, and Plan mapping characterized; no lookup port, adapter, or runtime
  redirect implemented
- Guide Publication Message Lookup Application Port, immutable request/result
  contract, and test fake implemented without adapter, composition, or runtime
  wiring
- Guide lookup infrastructure adapter dependency, channel-resolution, and
  error/count risks characterized with test-only resources; no adapter added
- Guide channel resource lifecycle and same-resource continuity characterized;
  production adapters remain blocked by re-resolution risk
- Guide infrastructure-local, per-invocation resource-session contract,
  lifetime, continuity, bridge models, and frozen failure/call-count fixtures
  prepared without production implementation or runtime wiring
- Guide production infrastructure resource session implemented and covered, but
  deliberately not wired to adapters, composition, or legacy runtime
- Guide Lookup Adapter session injection, result mapping, continuity, and
  isolation prepared with test-only adapter coverage; no production adapter
  or runtime wiring
- Guide production Lookup Adapter implemented against the existing Session and
  Lookup Port, deliberately without composition or runtime wiring
- Guide Mutation Adapter session-injection, result/failure mapping, adapter
  pair continuity, and isolation frozen with test-only candidate coverage
- Guide production Mutation Adapter implemented against the existing Resource
  Session and Mutation Port shape, deliberately without runtime wiring
- Guide per-invocation lookup/mutation adapter-pair lifetime, ordering,
  persistence handoff, isolation, and composition candidates characterized
- Guide production stateless Adapter Pair Factory implemented without
  composition or runtime wiring
- Guide Composition Feature ownership, state, injection, handoff, and rollback
  boundary prepared with a test-only candidate
- Guide production Adapter Pair Composition Feature implemented with lazy Pair
  factory delegation, zero retained state, and no runtime wiring
- Guide Runtime Pair Creation timing, identity, isolation, zero-I/O, and
  coexistence behavior characterized; runtime insertion remains unapproved
- Guide ensured-channel constructor surface frozen; successful ensure output
  satisfies Pair construction and preserves zero-I/O construction
- Guide Runtime Pair Creation-only integrated after successful ensure, without
  port use or changes to legacy Discord/persistence/Roadmap behavior
- Guide Runtime Lookup Redirect boundary characterized with frozen skip,
  failure, malformed-ID, identity, ordering, and test-only candidate coverage;
  runtime lookup remains legacy-owned
- Guide Lookup Message Identity Handoff lifecycle, ownership, purity, isolation,
  and no-second-fetch requirements frozen without production implementation
- Guide Resource Session retained-message accessor implemented as synchronous,
  read-only, per-session infrastructure capability without runtime wiring
- Guide Pair retained-message handoff capability prepared with a test-only
  narrow delegate, frozen identity/no-second-fetch/isolation invariants, and
  explicit guards that production Pair and runtime remain unchanged
- Guide Pair now exposes the narrow synchronous retained-message delegate while
  retaining Session privacy and leaving all runtime I/O legacy-owned
- Runtime Lookup Redirect final preparation refreshed against the production
  Pair handoff surface; no runtime redirect implemented
- Runtime Guide lookup redirected through the existing Adapter Pair while
  preserving legacy edit/send, persistence, and Roadmap continuation
- Runtime mutation redirect characterized; send-message and raw failure-identity
  handoffs remain explicit blockers
- Send Message identity handoff prepared; existing retained-message capability
  can carry the exact sent Message in a future Session-only slice

## Architecture Health
- Architecture Score: 100 / 100
- Circular Dependencies: 0
- Reverse Layer Dependencies: 0

## Current Ownership
### New Architecture
- Guide publication planning
- Community read-only logic
- Migration orchestration
- Guide/Roadmap publication record persistence
- Guide-specific Discord mutation contract preparation
- Guide-specific Discord mutation Application Port and test adapter
- Guide-specific Discord mutation Infrastructure Adapter preparation
- Guide pre-Plan message lookup preparation documentation and frozen tests
- Guide Publication Message Lookup Application Port and lookup test fake
- Guide Message Lookup Infrastructure Adapter preparation documentation/tests
- Guide Channel Resource Boundary preparation documentation/tests
- Guide Infrastructure Resource Session preparation documentation/tests
- Guide production Resource Session implementation, isolated infrastructure
  tests, and not-wired regression guards
- Guide Lookup Adapter using Session boundary preparation documentation/tests
- Guide production Lookup Adapter implementation, compatibility, continuity,
  isolation, port compliance, and not-wired guards
- Guide Mutation Adapter using production Session preparation, with no
  production Mutation Adapter, composition wiring, or runtime redirect
- Guide production Mutation Adapter implementation, compatibility, continuity,
  isolation, port compliance, and not-wired guards
- Guide adapter-pair composition preparation with test-only factory; no
  production pair factory, composition feature, or runtime redirect
- Guide production Adapter Pair Factory implementation and not-wired guards
- Guide Adapter Pair Composition Feature implemented but not runtime-wired;
  legacy runtime still owns lookup, mutation, failure handoff, and ordering
- Ensured Channel constructor contract is frozen; no runtime consumer added
- Runtime creates a fresh Pair per Guide setup invocation; legacy I/O remains
  the owner of lookup, mutation, persistence, and Roadmap continuation
- Exact Discord Message identity remains private to the Infrastructure Session;
  the accessor is not exposed through Pair, Composition, Application, or Runtime
- Production Pair retained-message handoff: implemented as a narrow delegate;
  runtime remains legacy-owned and does not consume it

### Legacy
- Discord mutation execution
- Some community mutation flows
- Roles
- Proposals
- Bootstrap
- Permission repair
- Voice / layout high-risk flows

## Deployment Status
- Local refactor: In progress
- GitHub: Current development source
- Vultr production: Pre-refactor legacy version
- Refactored production deployment: Not started

## Deployment Readiness
Not ready for production replacement yet.

Target for first refactored Vultr deployment:
- Guide publication runtime integration complete
- Persistence writer/repository migration complete
- Full test suite green
- Architecture gate green
- Rollback path prepared

## Next Recommended Slice
Implement Session send-success retained-message semantics only.

## Required Checks After Every Slice
- Relevant tests PASS
- Migration tests PASS
- Architecture gate PASS
- Legacy audit PASS
- Quality gate PASS

## Blockers
Guide Discord execution remains coupled to message lookup, channel destination,
channel ensure, partial failure, and Roadmap continuation. The production
Lookup Port maps all failures to unavailable but its public result lacks the
exact `Message` object required by the legacy edit branch. A Session-local,
per-invocation accessor now retains exact identity through the production Pair,
but is not visible to Runtime; channel re-resolution or a second fetch would
add legacy-incompatible behavior.

## Last Updated
2026-08-09: Pair retained-message handoff capability implemented; runtime
lookup and mutation behavior remain unchanged.
