# Community Channel Setup Boundary Implementation Result

## Scope

`CommunityChannelSetupCompatibilityAdapter` now owns the exact Concierge
category, Guide channel, and Roadmap channel ensure operations. The runtime
constructs a fresh adapter for each Guide or Roadmap setup invocation.

## Preserved Contracts

- Category lookup is exact by `GuildCategory` type and name; missing categories
  are created with the existing `Community concierge setup` reason.
- Guide lookup is exact by `GuildText` type and name. Existing Guide channels
  are retained, repaired to the entry category only when needed, and always
  receive the existing best-effort onboarding overwrite refresh.
- Guide parent failures propagate unchanged and prevent the overwrite attempt;
  overwrite failures remain swallowed and return the exact channel object.
- Roadmap channels retain their historical asymmetry: existing channels are
  returned unchanged, including a mismatched parent. Missing channels are
  created under the ensured category.
- No retry, rollback, delete, publication, persistence, reply, embed, or
  logging responsibility was added to the adapter.
- The existing `onboardingVisible` template is injected by Concierge and
  executed only by the adapter, preserving the template while avoiding an
  Infrastructure-to-config reverse dependency.

## Ownership

| Responsibility | Owner |
| --- | --- |
| Category / Guide / Roadmap channel lookup and mutation | Infrastructure adapter |
| Guide and Roadmap publication lookup, mutation, persistence, and return | Existing runtime boundaries |
| Welcome channel resolution and DM delivery | Existing Welcome boundaries |
| AI concierge text generation | Runtime |

## Verification

The implementation suite covers existing, missing, wrong-parent, overwrite
failure, parent failure, type/name duplicates, create failure, identity, and
partial-success behavior. The Concierge runtime has no direct
`guild.channels.create`, `channel.setParent`, or `permissionOverwrites.set`
call for these operations.
