# Community Guide Discord Mutation Lookup Ownership

## Options Considered

| Option | Decision | Reason |
| --- | --- | --- |
| A. Runtime looks up Message/Channel and passes objects to port | Rejected | leaks Discord.js objects through Application and preserves no clean seam |
| B. Port accepts IDs; infrastructure adapter performs both lookups | Candidate | keeps Application pure and makes resource failures explicit |
| C. Port looks up Edit target; runtime resolves Send destination | Rejected | splits one resource contract and complicates failure/timing tests |
| D. Keep all lookup legacy-owned | Current state only | no migration boundary is created |

## Preparation Decision

The future Guide-specific port contract will accept scalar resource identity.
Its future infrastructure adapter, not Application or legacy runtime, should
resolve the Message for Edit and Channel for Send. No adapter is created here.

## Compatibility Requirements for Later Work

- Preserve Edit fetch timing: only after channel ensure, only for a truthy
  tracked ID, and never in force mode.
- Preserve the current one-fetch behavior and `.catch(() => null)` conversion.
- Preserve Send destination semantics: the ensured Guide channel is the target.
- Preserve propagated edit/send failures and the send/edit-before-persistence
  ordering.
- Do not introduce retries, message-history scans, fallback channels, repair,
  duplicate detection, or identity normalization without a separately approved
  runtime slice.
