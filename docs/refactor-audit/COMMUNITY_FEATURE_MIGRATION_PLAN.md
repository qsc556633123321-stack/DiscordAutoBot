# Community Feature Migration Plan

## Definition and current boundary

Community owns server structure intent, onboarding/guide experience, community role access facts, bootstrap workflows, proposal workflow, and maintenance orchestration. It does not own Voice lifecycle, MemberGuard enforcement, Layout execution, generic Discord infrastructure, Memory, Organizer, Audit, or Dashboard infrastructure.

## Subdomain map

| Subdomain | Main current files | Active runtime | Effects / persistence | Risk / slice readiness |
| --- | --- | --- | --- | --- |
| Community Core | `domain/community/communityArchitectureV3.js`, `permissionMatrix.js` | Permission service, game policy, architecture scripts | none | Medium; facts are pure but shared broadly. |
| Onboarding and Concierge | `systems/communityConcierge.js`, `interactiveGuideSystem.js`, `welcomeSystem.js`, `guildMemberAdd.js` | guide commands and member-add event | messages/DMs, guide channels, onboarding/roadmap JSON | Medium for read-only queries; High for setup/mutation. |
| Roles and access | `roleManagerRuntime`, `rolePermissions`, `guestGate`, `communityPermissionService` | role/setup/visibility commands and MemberGuard-adjacent event path | role changes, overwrite changes, role/settings JSON | Very High; not first. |
| Bootstrap and rebuild | `communityBootstrapSystem`, `communityV3BuilderRuntime`, `serverPolisher`, `serverRebuilder`, rebuild service | grouped rebuild/bootstrap commands, interaction confirmations | categories/channels/roles/overwrites/plans | Very High; last-stage. |
| Panels and navigation | `channelPanelsRuntime`, `channelPanels`, Concierge | panel setup command and interaction buttons | messages and panel JSON | High; overlaps ticket/Voice/roles. |
| Proposals | `gameSuggestionSystemRuntime`, `suggest-game` | commands, modal/button interactions | suggestion/game-category JSON, categories and create entries | Very High; depends on Games and Voice. |
| Community maintenance | architect/health/validator/structure systems | audit/plan/confirm interaction paths | plans, category moves/renames/permission sync | Very High; belongs beside Layout but remains a Community consumer. |

## Recommended sequence

```text
Discovery complete
  -> Slice 1: Community About query (complete; thin wrapper retained)
  -> Slice 2: Community Roadmap query (complete; thin wrapper retained)
  -> Slice 3: `/help-me-start` recommendation query (complete; thin wrapper retained)
  -> role access policy + self-role mutation
  -> Guide payload read/renderer slice (complete; status and setup mutation remain legacy)
  -> guide setup message/channel workflow
  -> bootstrap preview plan
  -> permission repair plan/application split
  -> proposal workflow after game/Voice contract
  -> layout/rebuild reconciliation
  -> Voice integration last
```

## Vertical-slice candidates

| Candidate | Current path | Proposed full slice | Effects / dependencies | Regression and rollback | Risk |
| --- | --- | --- | --- | --- | --- |
| 1. **Community About (recommended)** | `/community-about` -> legacy command -> `systems/communityConcierge.buildAboutEmbed` -> interaction reply | presentation command -> query use case -> pure Community profile facts -> read gateway for guild name -> composition -> active alias wrapper | Embed reply only; no Voice/Layout/Permission Repair, no persistence. | Snapshot normalized embed fields and reply payload; wrapper re-export/legacy fallback remains. | Low |
| 2. Community Roadmap query | `/community-roadmap` -> legacy command -> Concierge -> `community-roadmap.json` -> reply | presentation -> query use case -> roadmap value object -> settings repository port -> JSON adapter -> composition | Reads one JSON file; no Discord mutation. | Fixture JSON + embed regression; legacy wrapper stays. | Low |
| 3. Onboarding visibility query | `/check-onboarding-visibility` -> migrated presentation/application -> permission service -> gateway -> legacy inspection | Complete the currently retained gateway behind a read port/composition. | Guild cache/native onboarding read; touches Permission Repair boundary but no mutation. | Existing migration suite plus fake gateway; wrapper already retained. | Medium |

### Recommendation: Slice 1, Community About

It is active, complete from slash input to ephemeral embed output, has a narrow boundary, has no persistence or mutation, needs no event changes, and does not touch Voice, Layout, or Permission Repair. It is therefore the best proof that Community composition can follow the same migration pattern as Memory, MemberGuard, and Audit. **Completed in Community Slice 1; the legacy wrapper remains intentionally.**

Estimated files: one legacy command wrapper, one presentation command, one application query, one pure domain profile module, one small guild-name/read port/gateway, one composition root, and migration tests. No existing runtime file moves/deletes are required.

## Prerequisites and last-stage areas

- **Permission Repair:** first stabilize a pure role/category policy fixture and a fake overwrite gateway.
- **Layout:** first define a one-way plan contract; no direct Community service import from layout rules.
- **Voice:** define game-entry metadata contract and complete Voice lifecycle migration before moving proposal execution.
- **Bootstrap/rebuild:** only after channel/role/permission gateways have idempotency and partial-failure fixtures.

## Definition of done

Every slice must preserve slash metadata, alias registry, output/reply behavior, data shape, and rollback source; add a focused regression test; pass quality gate/dashboard build; and leave legacy as an explicit wrapper/fallback during the observation window. Community is complete only when no active Community service imports legacy, all mutations go through ports, and cross-feature APIs are one-way and tested.

## Discovery Completion Addendum

`/help-me-start` is now migrated with its optional-AI fallback, exact Embed output, and legacy thin wrapper preserved. The Community Guide payload read/renderer slice is also complete; `setupCommunityGuide` remains the compatibility-owned publish workflow. Guide status, publication, role selection, onboarding event behavior, panels, proposals, bootstrap/rebuild, Architect execution, and maintenance remain deferred behind their recorded blockers.

## Community Mutation Runtime Discovery

Mutation discovery is complete. The evidence maps active entries, side effects, ownership, dependencies, risks, and blocked candidates without migrating any mutation runtime. No mutation slice is marked migrated.

## Guide Mutation Baseline Update (2026-07-25)

The Guide setup/refresh mutation path has frozen baseline tests and a readiness
decision. No production mutation, composition, adapter, or wrapper moved in
this work; Community remains **Migration In Progress**.

## Shared Persistence Contract Update (2026-07-25)

The shared Guide/Roadmap persistence behavior is now frozen by tests and audit
documents. No repository, port, or mutation runtime has moved.

Publication Identity Contract documentation is complete. Community remains
**Migration In Progress**; no identity runtime moved.

## Publication Read Runtime Integration (2026-07-26)

Guide Existing Publication State Read is integrated through the pure mapper.
This is read-only: no Guide mutation, persistence, writer, adapter, or
Roadmap runtime has moved. Community remains **Migration In Progress**.

Roadmap Existing Publication State Read is now integrated by the same
read-only mapper contract. It does not migrate Roadmap mutation, persistence,
writer replacement, or any shared publication workflow.

## Channel Lookup Characterization (2026-07-26)

Characterization Slice #1 freezes the active `sendConciergeWelcome` Guide
channel lookup consumer, including cache/fetch/name fallback and member-DM
behavior. It is documentation and tests only: channel identity is not
integrated, no channel port/adapter exists, and Community remains **Migration
In Progress**.

## Welcome Delivery Preparation (2026-07-29)

Preparation Slice #2 adds pure request/result contracts, a pure DM payload
builder, and a resolved-ID mapper. No Community runtime imports them; delivery,
lookup, persistence, ports, adapters, and composition remain unchanged.

## Welcome Message Builder Runtime Integration (2026-08-01)

`sendConciergeWelcome` now uses the Application barrel mapper and pure builder
for its existing DM payload only. Channel lookup, DM API/catch behavior,
persistence, and all broader delivery concerns remain legacy-owned.

Guide publication runtime integration preparation is complete. Community Guide
execution remains legacy-owned until a separate bounded integration review.

## Publication Persistence Migration Update (2026-08-08)

The Guide/Roadmap publication writer/repository is migrated through the
application, composition, and filesystem adapter boundary. Guide Discord
execution remains legacy-owned. Execution Request is prepared but not
integrated; the next preparation target is a Guide-specific Discord mutation
port.

## Guide Infrastructure Adapter Preparation (2026-08-08)

Adapter dependencies and lookup/failure behavior are characterized only. The
legacy pre-Plan fetch-to-Send fallback cannot be reproduced by a post-Plan Edit
request, so production adapter implementation remains blocked.

## Guide Discord Mutation Port Preparation (2026-08-08)

The Guide Edit/Send boundary now has frozen resource identity, lookup ownership,
result, failure, and compatibility evidence. This did not migrate Discord
execution. Publication persistence remains new-architecture owned; Guide
Discord lookup and `message.edit` / `channel.send` remain legacy-owned.

## Guide Discord Mutation Application Port (2026-08-08)

The pure Application Port and test fake now represent Edit/Send identity and
scalar result/failure contracts. They are not injected into runtime. Discord
lookup/mutation, persistence handoff, and Roadmap continuation remain legacy.
