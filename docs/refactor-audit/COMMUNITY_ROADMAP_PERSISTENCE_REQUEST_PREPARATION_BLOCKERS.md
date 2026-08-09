# Roadmap Persistence Request Preparation Blockers

1. Runtime persistence sequencing is still legacy-owned.
2. The generic writer is shared with Guide and onboarding fields.
3. A new Roadmap repository/writer is rejected as duplication.
4. Writer failure remains adapter-owned log-and-swallow behavior.
5. Generic guild validation and raw request scalar policy must be reconciled
   by the next application-only contract slice.
6. Async conversion, result consumption, runtime redirect, and schema changes
   are outside this preparation slice.
