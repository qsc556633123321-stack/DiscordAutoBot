# Community Guide and Roadmap Mutation Coupling Baseline

## Verified Coupling

`/setup-community-guide` and `/refresh-community-guide` share the following
command-level sequence:

```text
deferReply(ephemeral)
→ member ManageChannels check
→ setupCommunityGuide(guild, mode)
→ setupRoadmapPanel(guild)
→ success editReply
```

The functions are separate runtime functions, channels and message records, but
they share `onboarding-flows.json` and the direct command success path.

## Failure Direction

| First failure | What does not run | What remains |
| --- | --- | --- |
| Guide ensure/payload/fetch-edit/send rejects | Roadmap call and command success reply | any earlier Guide category/channel operation |
| Guide JSON write fails | nothing: Guide function resolves, then direct command calls Roadmap | Guide Discord message may be untracked |
| Roadmap ensure/embed/fetch-edit/send rejects | command success reply | successful Guide publication and record write |
| Roadmap JSON write fails | nothing after it; function resolves and command success reply occurs | published Roadmap may be untracked |

## Shared State and Compatibility Constraints

- Guide and Roadmap IDs are fields under the same per-guild JSON object.
- Each `saveOnboarding` call merges the current record, adds `updatedAt`, and
  synchronously writes formatted JSON.
- No transaction spans the two calls. A successful Guide must not be rolled back
  because Roadmap later fails.
- No retry orchestration exists beyond manually re-running the command.
- Bootstrap/V3 use `setupCommunityGuide({ mode: 'refresh' })` as a best-effort
  indirect call; they do not directly call `setupRoadmapPanel` in the verified
  source paths.

## Migration Consequence

Guide and Roadmap must be treated as coupled at the command workflow boundary,
but not as one atomic Discord transaction. This remains a blocker for extracting
either publisher without a precise persistence/recovery contract.

## Shared Persistence Contract Update (2026-07-25)

That contract is now characterized in the dedicated persistence audit. It does
not change the current coupled workflow or approve a publisher migration.
