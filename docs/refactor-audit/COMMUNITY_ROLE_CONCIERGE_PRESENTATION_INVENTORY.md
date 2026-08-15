# Community Role Concierge Presentation Inventory

## Scope

This preparation slice inventories only the semantic Concierge actions `games`,
`invest`, and `dev`. Prefix matching and exact customId resolution are already
migrated; this document does not reopen them.

| Action | Current runtime branch | Workflow owner | Current presentation owner | Reply | Return |
| --- | --- | --- | --- | --- | --- |
| `games` | `handleConciergeButton` | `CommunityRoleQuickActionUseCase` through the Composition feature | `communityConcierge.js` | one ephemeral embed | `true` |
| `invest` | `handleConciergeButton` | same | `communityConcierge.js` | one ephemeral embed | `true` |
| `dev` | `handleConciergeButton` | same | `communityConcierge.js` | one ephemeral embed | `true` |

Each branch constructs a feature per button invocation, executes with the
semantic action, computes runtime-owned links, replies once, then returns
`true`. Unknown actions continue to return `false` from the enclosing handler.

## Exclusions

Guide, Roadmap, Welcome, filesystem ownership, role mutation Gateway, role
UseCase, composition, resolver, button dispatcher, and non-role payloads are
outside this slice.
