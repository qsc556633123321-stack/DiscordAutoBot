# Community Filesystem Read Behavior Matrix

| Situation | Frozen current behavior |
| --- | --- |
| Missing data directory | `mkdirSync(DATA_DIR, { recursive: true })` before file check; failure propagates. |
| Missing onboarding file | `writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8')`; default is exactly `{}`; failure propagates. |
| Valid object / multi-guild object | Parse and return the parsed object. |
| Empty file | Read expression becomes `'{}'`; returns a fresh parsed empty object. |
| Malformed JSON / read error | Exactly one `console.error('Read onboarding-flows.json failed:', error)`, return supplied fallback, and do not rewrite the existing file. |
| `null`, array, string, number, boolean root | Return supplied fallback without logging. |
| Result freshness | No cache: every successful invocation reads and parses again. |
| Encoding | Every read/write uses `utf8`. |

The future Infrastructure boundary, not `CommunityOnboardingStateReader` or tracking adapters, owns this compatibility behavior.
