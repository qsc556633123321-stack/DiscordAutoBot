# Community Roadmap Source Audit

| Topic | Result |
| --- | --- |
| Source of truth | `src/data/community-roadmap.json` |
| Schema | Object with required `completed`, `inProgress`, `future` arrays; items retain source order and stringify as legacy template literals did. |
| Status / section order | Fixed legacy order: completed, inProgress, future. Unknown top-level keys are ignored. |
| Empty values | Valid empty arrays render `整理中` per section. |
| Missing or parse-invalid file | Existing fallback roadmap is returned without writing a new file. |
| Non-object JSON | Existing fallback roadmap is returned. |
| Malformed object shape | Domain rejects a missing/non-array required section; command preserves propagated failure rather than inventing an error reply. |
| Encoding / read mechanism | UTF-8 `fs.readFileSync` inside the new infrastructure adapter only. |
| Active writer / dashboard writer / DB | None found for this slice. Existing guide/onboarding JSON mutation is outside this slice. |
| Cache / backup / duplicate source | None found. No `roadmap-v2`, copy, database, or hardcoded Domain roadmap exists. |

The fallback item content was moved once from the old Concierge helper to `infrastructure/community/communityRoadmapGateway.js`. This prevents a second fallback copy while keeping the user-visible legacy fallback content unchanged.
