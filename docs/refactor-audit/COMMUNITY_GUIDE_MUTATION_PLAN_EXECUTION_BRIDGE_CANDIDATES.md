# Guide Publication Plan Execution Bridge Candidates

| Candidate | Result |
| --- | --- |
| A. No bridge object; build the existing pure Plan after fetch | Recommended |
| B. Pure execution context | Rejected: duplicates existing Plan input |
| C. Pure branch decision | Rejected: duplicates Plan operation |
| D. Execution request | Rejected: risks payload/channel leakage |
| E. Execution service | Rejected: runtime mutation abstraction not approved |
| F. Discord mutation port | Rejected: port/adapter not approved |

No additional bridge contract is required. Any future integration must map only
`guildId`, `mode`, `trackedMessageId`, and `existingMessageAvailable` into the
existing pure input, with malformed legacy values preserved unchanged.
