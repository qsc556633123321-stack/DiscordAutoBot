# Community Guide Lookup Runtime Mapping Candidates

- **A — redirect-only:** Available maps to the exact retained Message; Unavailable maps to `null`; legacy mutation remains. Best semantic match, but blocked because the current public Pair/Lookup Port does not expose that exact Message.
- **B — Failure throws:** rejected. It changes legacy catch-to-null behavior.
- **C — collapse adapter failure as unavailable:** already true in the adapter; still blocked by Available identity.
- **D — adapter plus legacy fallback fetch:** rejected. It doubles I/O and changes timing/counts.

No candidate is approved for runtime integration in this preparation slice. The lowest-risk next step is to prepare an explicit, tested message-identity handoff surface without changing the current Port result or runtime.
