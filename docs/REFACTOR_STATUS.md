# DiscordAutoBot Refactor Status

## Current Phase
Deployment Readiness Preparation (Slice #93)

## Overall Progress
Estimated local refactor progress: 97%. This readiness preparation adds no
production migration. Community Concierge exact-ID mapping, prefix dispatch,
role workflow, role/non-role payload construction, channel setup, AI transport,
and filesystem ownership remain migrated; Runtime retains intentional thin
orchestration and prompt/request semantics.

## Latest Completed
- Refactored Community deployment readiness prepared: local build, test,
  dependency, startup, data, environment, Discord-intent, backup, rollback,
  and smoke evidence is documented. Vultr replacement remains blocked pending a
  read-only server audit and data-preservation verification.
- Community Concierge AI text transport migrated: Infrastructure now owns
  per-call API-key lookup, lazy OpenAI loading, client/request transport,
  response normalization, and silent fallback. Runtime retains the exact
  Traditional-Chinese prompt, request construction, and compatibility helper.
- Community role quick-action workflow migrated: semantic action mapping is
  Application-owned and Discord lookup/add mutation is Infrastructure-owned;
  Concierge presentation and legacy dispatch behavior remain unchanged
- Role Quick Action Workflow: MIGRATED. Direct Runtime Role Mutation: REMOVED.
  Role presentation remains Runtime-owned; button prefix dispatch is migrated
  to the modern button family.
- Community Concierge button dispatch prepared: legacy `concierge_` prefix
  ownership, handler return handling, generic error reply, role isolation, and
  non-role presentation boundaries are frozen; no production source moved
- Community Concierge semantic button resolver preparation froze six exact-ID
  action mappings, null-only unknown behavior, input compatibility, and branch
  equivalence before the production migration
- Community Concierge semantic button resolver migrated: pure Application
  resolution now owns the six exact customId mappings; Runtime retains semantic
  presentation, while prefix dispatch and compatible error handling moved to the
  modern button family
- Community Concierge button dispatch migrated: the modern Concierge family now
  owns the exact prefix matcher and compatible error wrapper; the legacy
  Concierge branch is removed while global fallback remains active
- Community non-role Concierge presentation prepared: Night, Bot, and Roadmap
  payload/reply/return contracts are characterized with a payload-only
  test candidate; no production runtime ownership moved
- Community non-role Concierge presentation migrated: Night, Bot, and Roadmap
  payload construction is Module-owned while reply, return, quick-link lookup,
  shared roadmap builder, and error-wrapper ownership remain unchanged
- Community role Concierge presentation prepared: Games, Invest, and Dev
  payloads, `added` result use, quick-link ownership, error propagation, and
  implementation limits are frozen with a test-only candidate; no production
  role presentation ownership moved
- Community role Concierge presentation migrated: Games, Invest, and Dev
  payload construction is Module-owned while role workflow, quick-link lookup,
  reply, return, routing, and error-wrapper ownership remain unchanged
- Community Channel Setup boundary prepared: Concierge Guide/Roadmap category
  and channel ensure behavior, duplicate rules, permission asymmetry,
  failure/partial-success behavior, and persistence handoffs are frozen with a
  test-only candidate; no production runtime ownership moved
- Community Channel Setup boundary migrated: Infrastructure now owns exact
  category, Guide, and Roadmap ensure behavior, including Guide parent and
  best-effort overwrite repair; Concierge retains publication and persistence
  ordering without direct channel mutation calls
- Community AI Text Generation boundary prepared: direct Concierge OpenAI key,
  request, response, fallback, and silent-failure contracts are frozen with a
  test-only transport candidate; no production runtime ownership moved
- Community role quick-action boundary prepared: add-only Concierge role intents,
  hierarchy checks, swallowed mutation rejection, button coupling, and
  presentation ownership are frozen without production changes
- Community filesystem ownership is closed: Guide, Roadmap, and Welcome now
  construct their JsonReader through the Infrastructure default-path factory;
  runtime `node:path`, `DATA_DIR`, and `ONBOARDING_FILE` ownership is removed
- JsonReader default-path boundary prepared with exact path, no-I/O construction, override, and closed-flow equivalence coverage
- Guide and Roadmap publication persistence runtime construction redirected to
  the existing filesystem adapter defaults; explicit runtime persistence paths
  are removed without changing persistence semantics
- Publication persistence path boundary prepared: Guide and Roadmap share the
  existing generic filesystem adapter defaults, while JsonReader path ownership
  remains a separate later boundary
- StateReader JSON dependency atomically migrated for Guide, Roadmap, and Welcome; JsonReader is runtime-active
- StateReader JSON dependency migration prepared with an atomic two-file implementation allowlist; production remains unchanged
- `CommunityOnboardingJsonReader` implemented as a read-only Infrastructure boundary and deliberately left runtime-unwired
- Community filesystem ownership, missing-file side effects, parse/fallback behavior, logging, and no-cache semantics characterized
- Future narrow read-only Infrastructure boundary approved: `CommunityOnboardingJsonReader`
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
- Resource Session now retains the exact successfully sent Message without a
  Pair, Adapter, or runtime redirect
- Mutation failure identity handoff prepared; exact original rejection and
  undefined-presence semantics remain necessary before runtime mutation redirect
- Session-local mutation failure handoff and narrow Pair delegate implemented;
  runtime mutation remains legacy-owned
- Runtime mutation redirect refreshed against completed Message/failure handoffs
- Runtime Guide mutation redirected through the Adapter Pair while preserving
  persistence and Roadmap continuation ordering
- Guide mutation redirect regression coverage now verifies exact `Error`,
  string, number, object, null, and undefined rejection identity plus
  invariant fallback behavior without post-mutation persistence or Roadmap work
- Roadmap continuation channel/message I/O, persistence timing, failure
  identity, partial-success behavior, and migration boundaries characterized
- Roadmap lookup truthiness, exact channel/message identity, rejection swallow,
  and no-retry behavior characterized
- Roadmap-specific per-invocation Resource Session implemented with retained
  message lifecycle coverage, deliberately not wired to runtime
- Roadmap Lookup Port contract prepared with test-only port/adapter candidates,
  frozen falsy-ID, rejection, identity, and no-extra-I/O behavior; production
  port, adapter, and runtime wiring remain unimplemented
- Roadmap Lookup Port application contract implemented without an adapter,
  composition, or runtime redirect; the Resource Session remains the sole
  infrastructure owner of Discord message identity and fetch semantics
- Roadmap Lookup Adapter boundary prepared with a test-only production-shape
  candidate; production adapter, pair, composition, and runtime remain absent
- Roadmap Lookup Adapter implemented against the Resource Session and Roadmap
  port factories, deliberately without pair, composition, or runtime wiring

## Architecture Health
- Architecture Score: 100 / 100
- Circular Dependencies: 0
- Reverse Layer Dependencies: 0

## Current Ownership
### New Architecture
- Community Concierge AI transport: MIGRATED to Infrastructure. Direct Runtime
  OpenAI SDK/client/request/response parsing is removed; prompt/request
  semantics and `generateConciergeText` compatibility API remain Runtime-owned.
- Community Concierge exact-ID mapping: MIGRATED to the pure Application
  resolver; semantic action resolution is Application-owned
- Community Concierge prefix dispatch and error wrapper: MIGRATED to the modern
  button family; legacy Concierge branch is removed
- Community Concierge non-role payload construction: MIGRATED to the Module
  presentation builder; runtime retains `interaction.reply`, `quickLinks`, and
  shared roadmap embed ownership
- Community Concierge role payload construction: MIGRATED to a dedicated Module
  builder; runtime retains role workflow execution, `quickLinks`, replies,
  returns, routing, and the outer error wrapper
- Community role quick-action workflow: MIGRATED to Application and
  Infrastructure; direct runtime role mutation remains removed
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
- Runtime creates a fresh Pair per Guide setup invocation; Pair ports now own
  Guide lookup and mutation while legacy runtime retains persistence sequencing
  and Roadmap continuation
- Exact Discord Message identity remains private to the Infrastructure Session
  and is exposed only through the narrow Pair handoff consumed by the Guide
  runtime
- Production Pair retained-message and mutation-failure handoffs are consumed
  by runtime mutation branches; persistence and Roadmap continuation remain
  legacy-owned
- Roadmap-specific Resource Session is implemented and audit-recognized as an
  approved not-yet-wired infrastructure source of truth
- Roadmap Lookup Port is implemented as an application-safe contract with no
  infrastructure dependency, adapter, composition feature, or runtime use
- Roadmap Lookup Adapter is implemented as isolated infrastructure mapping with
  no retained-message surface or runtime consumer
- Dependency analysis now recognizes the narrow Infrastructure-to-Application
  Port contract bridge required by infrastructure adapters
- Roadmap Adapter Pair boundary is frozen as a test-only candidate with one
  per-invocation Session, one Lookup Adapter, and narrow retained-message
  handoff; production pair, composition, and runtime remain absent
- Roadmap Adapter Pair Factory is implemented as isolated infrastructure with
  no composition, runtime, mutation, or persistence wiring
- Roadmap Composition boundary is frozen as a test-only feature candidate that
  delegates only to the Pair Factory and retains no state
- Roadmap Composition Feature is implemented with Pair Factory delegation only,
  but is not imported by runtime
- Roadmap Runtime Pair Creation is characterized as a zero-I/O, per-invocation
  boundary; lookup, mutation, and persistence remain legacy-owned
- Roadmap Runtime Pair Creation is implemented: runtime creates one fresh,
  unused Pair after channel ensure while lookup, mutation, and persistence stay legacy-owned
- Roadmap Runtime Lookup Redirect is characterized with a test-only candidate:
  falsy IDs skip lookup, truthy IDs make one lookup, failures map to Send, and
  retained Message identity is continuous without a second fetch
- Roadmap Runtime Lookup Redirect is migrated through the existing
  Composition/Pair/Lookup Port path; direct legacy fetch is removed while
  Edit/Send and persistence sequencing remain legacy-owned
- Roadmap Mutation boundary is characterized: direct Edit/Send, exact resource
  identity, failure propagation, call ordering, and writer-swallowed
  partial-success behavior are frozen without production migration
- Roadmap Mutation Port boundary is prepared with a test-only contract:
  separate scalar Edit/Send operations, result discriminators, identity and
  raw-rejection constraints, and explicit persistence exclusion
- Roadmap-specific Application Mutation Port implemented with immutable scalar
  request/success factories and no Adapter, Session mutation, Pair, runtime,
  or persistence wiring
- Roadmap Resource Session mutation semantics characterized with a test-only
  candidate: retained Message identity, Send handoff, presence-aware failures,
  stale-failure clearing, lookup interaction, and zero-extra-I/O constraints
- Roadmap Resource Session mutation extension implemented with retained-message
  identity, exact raw failure handoff, and zero persistence/runtime wiring
- Roadmap Mutation Adapter boundary prepared with a frozen test-only candidate,
  strict Edit identity invariant, raw failure propagation, and no runtime wiring
- Roadmap Mutation Adapter implemented as an isolated infrastructure mapping;
  Pair, composition, runtime, and persistence remain unchanged
- Roadmap Pair Mutation Surface prepared with a same-Session test candidate;
  production Pair, composition, runtime, and persistence remain unchanged
- Roadmap Pair Mutation Surface implemented with one shared Resource Session;
  Composition, runtime mutation, and persistence remain unchanged
- Roadmap Composition mutation boundary verified as an existing exact Pair
  pass-through; no Composition production modification is required
- Roadmap Runtime Mutation Pair Consumption verified as already available;
  consumption-only production wiring is unnecessary and runtime stays legacy
- Roadmap Runtime Mutation Redirect contract characterized with exact M/S,
  rejection, persistence, and return-identity constraints
- Roadmap Runtime Mutation Redirect implemented through the existing Pair while
  retaining legacy persistence sequencing and writer-swallowed partial success
- Roadmap persistence runtime, schema, merge, ordering, failure, identity,
  read-after-write, cross-field, and sequential-concurrency behavior frozen;
  no production persistence path changed
- Roadmap persistence request boundary prepared; generic Community publication
  persistence is the reuse target and duplicate Roadmap writer/repository is
  rejected without changing runtime
- Roadmap persistence pure Application request and generic-input mapper
  implemented without runtime, infrastructure, composition, or schema wiring
- Roadmap persistence reuse feature boundary prepared with an exact generic
  feature delegation candidate; no production reuse feature or runtime wiring
- Roadmap persistence reuse Composition feature implemented as a synchronous
  request-to-generic delegation with exact result and thrown-value identity;
  runtime now consumes it after finalized Roadmap mutations
- Roadmap runtime persistence redirect ordering, result-ignore behavior,
  writer-failure partial success, invariant throws, and exact ID contracts
  prepared with a test-only candidate; no runtime source changed
- Roadmap runtime persistence redirected after finalized Edit/Send Message to
  the semantic request and reuse feature, preserving synchronous ordering,
  result-ignore behavior, raw invariant throws, and partial success
- Community Roadmap end-to-end closure audit completed: runtime lookup,
  mutation, and persistence are verified through one shared Resource Session,
  approved Pair/Port/Composition surfaces, and legacy-compatible persistence
  without direct Roadmap runtime Discord or filesystem I/O
- Guide persistence boundary prepared: one legacy synchronous write after a
  successful Guide mutation contains publication IDs and native task
  recommendations; Guide runtime persistence and `saveOnboarding` remain
  legacy-owned pending the next pure Application request slice
- Guide Persistence Request implemented as a pure, legacy-compatible
  Application request/mapper with exact four-field atomic grouping; it is not
  runtime-used and Guide persistence remains legacy-owned
- Guide Persistence Reuse boundary prepared with a production-shape test
  candidate that delegates the existing Guide mapper to the generic
  publication feature exactly once, synchronously, and without adding a
  writer, repository, Port, adapter, or runtime wiring
- Guide Persistence Reuse Composition feature implemented with the same
  synchronous, one-execute delegation contract; it is not runtime-used and
  `saveOnboarding` remains Guide's final known runtime persistence consumer
- Guide Runtime Persistence Redirect boundary prepared with frozen legacy/future
  ordering, exact four-value mapping, writer partial-success, invariant identity,
  per-invocation construction, and `saveOnboarding` retirement constraints
- Guide Runtime Persistence redirected through the semantic request and reuse
  feature with per-invocation construction; direct Guide `saveOnboarding` call
  is removed while the zero-consumer helper remains retained for cleanup review
- Guide end-to-end closure audited: lookup, mutation, and persistence are
  migrated; tracked publication state remains a classified shared read
  compatibility dependency, so Guide is closed with that dependency recorded
- Guide tracked-state read boundary prepared: Guide, Roadmap, and welcome
  consumers share one compatibility reader; a Guide-only content feature is
  not reusable for publication tracking state
- Shared tracking-message read contract prepared: Guide and Roadmap share a
  narrow semantic query, while welcome channel tracking remains a separately
  forecasted consumer
- Shared channel tracking read Port and compatibility Adapter are
  Architecture-owned and implemented, but not runtime-used
- Shared Publication Tracking Read Port and compatibility adapter implemented
  as an isolated, one-read boundary; neither is composed nor runtime-used
- Combined Guide + Roadmap shared tracking-read redirect construction,
  ordering, failure, raw-fallback, and Welcome-isolation behavior prepared
- Combined Guide + Roadmap shared tracking-read runtime redirect implemented
  through the approved Port and compatibility Adapter; Welcome remains legacy-owned
- Community Guide migration closure re-audited and marked CLOSED: read, lookup,
  mutation, and persistence now have boundary ownership
- Welcome tracked-channel read contract, compatibility behavior, and a separate
  shared channel-boundary implementation path prepared without runtime changes
- Shared channel tracking Application Port and compatibility Adapter implemented
  without redirecting Welcome runtime
- Welcome runtime redirect ordering, construction, cache/fetch/name fallback,
  delivery, failure, and single-read compatibility prepared without runtime changes
- Welcome tracked-channel runtime read redirected through the shared channel
  tracking Port and compatibility Adapter without changing lookup or delivery behavior
- Shared legacy onboarding helper cleanup characterized: `saveOnboarding` has
  zero consumers, while `readOnboardingData` remains an injected adapter dependency
- Infrastructure onboarding-state reader boundary, filesystem compatibility,
  adapter dependency, and migration sequence prepared without runtime changes
- `CommunityOnboardingStateReader` implemented as an Infrastructure-only,
  non-runtime-wired compatibility reader
- Tracking adapter dependency migration frozen: both adapters require an atomic
  reader-object plus runtime-injection replacement; no dual-mode contract is approved
- Message and channel tracking adapters are reader-backed at runtime; Guide,
  Roadmap, and Welcome each construct the existing reader per invocation
- `readOnboardingData` and `saveOnboarding` audited as private zero-consumer
  definitions; combined cleanup is prepared without filesystem restructuring
- `readOnboardingData` and `saveOnboarding` removed after their zero-consumer
  audits; Guide, Roadmap, and Welcome remain reader-backed at runtime
- Community Concierge closure audit completed: Guide and Roadmap are CLOSED,
  Welcome tracking is migrated but its channel recovery and DM delivery remain
  Runtime-owned; direct persistence bypass remains zero
- Welcome final closure preparation completed: cache/fetch/fallback/channel
  identity and swallowed DM failure contracts are frozen without runtime changes
- Community Welcome channel resolver implemented as an Infrastructure-only,
  non-runtime-used boundary; cache/fetch/fallback semantics remain covered
- Welcome resolver runtime redirect preparation completed with an equivalent
  test-only candidate; production runtime remains unchanged
- Welcome channel resolution now routes through the Infrastructure resolver;
  direct DM delivery remains runtime-owned
- Welcome DM delivery boundary preparation completed with recipient, payload,
  failure, and no-channel contracts frozen; runtime remains unchanged
- Welcome DM delivery adapter implemented as an isolated Infrastructure boundary;
  runtime remains direct pending redirect preparation
- Welcome DM runtime redirect prepared with construction, no-channel, identity,
  await, result-discard, and failure equivalence coverage; runtime remains direct
- Welcome DM runtime delivery redirected through the isolated Infrastructure
  adapter while retaining tracking, resolver, payload, and filesystem ownership
- Community Welcome migration closure audited and marked CLOSED: tracking,
  channel resolution, and DM delivery are boundary-owned at runtime

- Roadmap persistence migration preparation owns frozen schema and regression
  contracts only; runtime sequencing and `saveOnboarding` remain legacy-owned
- Roadmap persistence request preparation owns a test-only scalar contract and
  reuse decision only; no production Port, mapper, adapter, or runtime wiring
- Roadmap persistence request/value object and pure mapper are new
  Application-owned code; generic persistence remains the reuse target and
  runtime sequencing remains legacy-owned
- Roadmap persistence reuse feature is Composition-owned and runtime-active for
  Roadmap publication; shared `saveOnboarding` remains for Guide consumers
- Roadmap runtime persistence redirect is runtime-active; only the Roadmap
  legacy persistence call was removed
- Roadmap Lookup, Mutation, and Persistence are runtime-active through their
  approved boundaries; Guide persistence and shared `saveOnboarding` remain
  legacy-owned
- Shared publication tracking read Port and compatibility adapter are new
  Architecture-owned code, but Guide/Roadmap runtime reads and Welcome channel
  tracking remain legacy-owned until redirect preparation is completed
- Shared publication tracking read Port and compatibility Adapter are runtime
  active for Guide/Roadmap; Welcome tracked-channel read remains legacy-owned

### Legacy
- Community Concierge AI text generation: ACTIVE in the runtime
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
BLOCKED pending manual Vultr server audit, live-data preservation verification,
environment/intent/permission confirmation, and deployment-manager discovery.

Target for first refactored Vultr deployment:
- Guide publication runtime integration complete
- Persistence writer/repository migration complete
- Full test suite green
- Architecture gate green
- Rollback path prepared

## Next Recommended Slice
Vultr Server Audit: perform a read-only inspection of the actual service
manager, release/data paths, Node runtime, environment presence, backup method,
and Discord configuration before any deployment execution preparation.

## Required Checks After Every Slice
- Filesystem ownership preparation, Guide/Roadmap/Welcome closure, onboarding reader, and tracking-adapter migration suites PASS
- `test:community`, `test:migration`, `test:architecture`, `test:legacy-boundaries`, `quality:gate`, `audit:legacy`, and `dashboard:build` PASS
- Dependency analysis PASS: Architecture Score 100/100, Circular Dependencies 0, Reverse Layer Dependencies 0
- Relevant tests PASS
- Migration tests PASS
- Architecture gate PASS
- Legacy audit PASS
- Quality gate PASS
- Roadmap persistence preparation suite PASS
- Roadmap persistence request/reuse preparation suite PASS
- Roadmap persistence request implementation suite PASS
- Roadmap persistence reuse feature preparation suite PASS
- Roadmap persistence reuse feature implementation suite PASS
- Roadmap runtime persistence redirect preparation suite PASS
- Roadmap runtime persistence redirect implementation suite PASS
- Dashboard build PASS

## Blockers
Guide, Roadmap, and Welcome are CLOSED. `readOnboardingData` and `saveOnboarding`
are removed. Runtime no longer owns onboarding filesystem paths or direct
JsonReader construction; Infrastructure owns the defaults, while the existing
JsonReader retains compatibility behavior. Role presentation remains
Module-owned; non-role payload construction and button prefix dispatch are
migrated. Direct channel setup is Infrastructure-owned and covered by exact
create, parent, overwrite, and failure compatibility tests. AI text-generation
transport is Infrastructure-owned; Runtime retains only prompt/request semantics
and the public compatibility helper.

Four stale architecture guards now validate committed source truth instead of
requiring the previous atomic migration to remain as an uncommitted `git diff`.
Filesystem cleanup preparation can be retried once this maintenance slice's
full verification completes.

The fifth stale implementation-time diff guard in
`communityFilesystemOwnershipPreparation.test.js` is repaired. Filesystem
cleanup remains NOT IMPLEMENTED; its preparation is READY TO RETRY after this
maintenance slice's full verification passes.

The sixth stale post-commit diff guard in
`communityStateReaderJsonDependencyPreparation.test.js` is repaired. Six
historical migration/preparation guards now validate committed source truth.
Filesystem cleanup remains NOT IMPLEMENTED and its preparation can proceed
only after this maintenance slice's full verification succeeds.

All required maintenance, preparation, migration, closure, architecture,
legacy-boundary, quality, audit, dashboard, and dependency checks now pass.
Dead `ensureFile` / `readJson` helpers, the runtime `node:fs` dependency, and
the remaining runtime `node:path` / onboarding path constants are removed.
Guide/Roadmap persistence and all JsonReader construction use their approved
Infrastructure defaults. Filesystem ownership is MIGRATED.

## Last Updated
2026-08-16: Prepared deployment readiness for the refactored Community
candidate. Local checks are green, structural refactor is stopped, and Vultr
replacement is blocked pending a manual server/data/configuration audit. Overall
progress remains 97%.
