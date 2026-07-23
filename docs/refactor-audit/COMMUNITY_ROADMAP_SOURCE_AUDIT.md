# Community Roadmap Source Audit

| Topic | Result |
| --- | --- |
| Formal source of truth | `src/data/community-roadmap.json` is the only editable normal-operation source. |
| Schema | Object with required `completed`, `inProgress`, `future` arrays; items retain source order and stringify as legacy template literals did. |
| Status / section order | Fixed legacy order: completed, inProgress, future. Unknown top-level keys are ignored. |
| Empty values | Valid empty arrays render `整理中` per section. |
| Missing or parse-invalid file | `DEFAULT_COMMUNITY_ROADMAP`, the legacy compatibility fallback snapshot moved from the Concierge reader, is returned without writing a new file. |
| Non-object JSON | Existing fallback roadmap is returned. |
| Malformed object shape | Domain rejects a missing/non-array required section; command preserves propagated failure rather than inventing an error reply. |
| Encoding / read mechanism | UTF-8 `fs.readFileSync` inside the new infrastructure adapter only. |
| Active writer / dashboard writer / DB | None found for this slice. Existing guide/onboarding JSON mutation is outside this slice. |
| Cache / backup / duplicate source | No `roadmap-v2`, copy, database, or hardcoded Domain roadmap exists. `DEFAULT_COMMUNITY_ROADMAP` is intentionally a full compatibility fallback snapshot, not a formal editable source. It may drift from the JSON source. |

The fallback item content was moved once from the old Concierge helper to `infrastructure/community/communityRoadmapGateway.js`. It preserves the user-visible legacy fallback contract, but it remains a duplicated snapshot by design. Removing or changing it requires a separate data-contract migration and is out of scope for this slice.
