# Community Mutation Test Coverage Audit

## Current coverage by boundary

| Boundary | Active-entry evidence | Existing regression coverage | Missing mutation baseline | Migration gate |
| --- | --- | --- | --- | --- |
| Guide mutation | setup/refresh commands and concierge runtime are source-audited | Guide/Roadmap read regression, migration and architecture boundaries | fake guild create/reuse/move/overwrite; tracked edit/send; JSON failure windows | must add before mutation extraction |
| Panels | setup command plus rebuild/proposal callers are source-audited | architecture/legacy-boundary static tests | create/refresh/force message ownership; stale record; send-before-record-write | must add before extraction |
| Bootstrap | bootstrap, layout rebuild and V3 command paths are source-audited | architecture and permission static tests | repeated ensure behavior; registry disagreement; partial role/channel/overwrite writes | blocked until fake guild fixture |
| Roles | setup/select/concierge/guest cleanup paths are source-audited | permission inheritance and architecture tests | hierarchy matrix, configured role create, add/remove ordering, queue retry | must add before role mutation migration |
| Onboarding | `guildMemberAdd` event and concierge DM are source-audited | MemberGuard boundary/static tests | guest creation/add, welcome send, DM failure isolation, reminder once-only behavior | must add before event extraction |
| Proposals | modal/buttons and archive command are source-audited | game identity and legacy routing tests | card persistence, vote state machine, alias duplicate approval, partial category build | blocked/high fan-out |
| Maintenance | commands and confirmation prefixes are source-audited | permissions, architecture and legacy audit | plan owner/staleness, protected-resource guards, partial destructive execution | blocked/high risk |

## Required baseline dimensions

Every mutation slice needs test cases for all applicable dimensions before legacy
logic is made a thin wrapper:

1. active entry and exact router/customId/command;
2. authorization and bot-permission/hierarchy denial;
3. existing-resource versus missing-resource behavior;
4. duplicate/idempotency key behavior;
5. Discord write success and failure;
6. data write success and failure;
7. message/record or resource/metadata partial-failure order;
8. documented retry behavior, including explicit absence of retry;
9. exact persisted record shape where a record is owned;
10. no unintended mutation of protected cross-feature resources.

## Existing suite relationship

- `test:community`, `test:migration`, `test:legacy-audit`, `test:architecture`
  and `test:legacy-boundaries` provide composition, compatibility and structural
  guardrails.
- `test:community-mutation-discovery` verifies that this Discovery inventory has
  all six detailed boundary documents and the required atomic-operation evidence.
- These tests do **not** prove live Discord mutation equivalence. That absence is
  a migration blocker, not a reason to infer behavior.

## Community Guide Mutation Baseline (2026-07-25)

`test:community-guide-mutation-baseline` freezes command metadata,
authorization/defer behavior, Guide/Roadmap message branches, persistence,
partial success, and mutation order through a test-only fake Discord/filesystem
harness. It is characterization, not a migration approval. The remaining
focused malformed-Roadmap-record branch is recorded in the coverage matrix.

## Shared Persistence Contract Baseline (2026-07-25)

`test:community-guide-roadmap-persistence-contract` adds a pure fixture and
filesystem harness for schema, preservation, read/write failure, sequential
write, and stale-read risk. It is baseline evidence only; no persistence port,
repository, or runtime mutation is approved.

The Publication Identity Contract adds frozen identity states and test-only
lookup harnesses. It does not implement validation, duplicate detection, or
recovery.

The channel lookup characterization suite now freezes the active welcome
consumer's cache/fetch/name branches, malformed identity pass-through, DM
failure swallowing, and zero persistence writes. It does not authorize a
runtime integration.

Welcome Delivery Preparation adds pure contract coverage only. Its tests do not
execute a delivery adapter or change existing member-DM behavior.

The builder integration suite now differentially proves exact payload equality,
lookup non-regression, and unchanged call counts without introducing an adapter.

## Recommended first test harness

Create a small fake guild/channel/message/role adapter only for the next chosen
vertical slice. Do not introduce a global Discord mock that silently normalizes
the different legacy failure semantics.
