# Guide vs Roadmap Publication Matrix

| Concern | Guide | Roadmap | Shared fit |
| --- | --- | --- | --- |
| Channel identity | Guide channel | Roadmap channel | Low |
| Lookup/mutation | Pair ports | direct legacy I/O | Low |
| Stored ID fields | `guide*` | `roadmap*` | Medium |
| Payload | Guide renderer | Roadmap embed | Low |
| Persistence writer | shared migrated writer | shared migrated writer | High |
| Session lifetime | Guide per invocation | none | Low |

The shared persistence boundary is sufficient. No shared Discord session or
generic publication abstraction is approved.
