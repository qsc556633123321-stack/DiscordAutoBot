# Community Concierge Remaining Risk Ranking

| Rank | Owner | Why it is risky | Recommendation |
| ---: | --- | --- | --- |
| 1 | Channel/category ensure plus permission overwrite | Direct Discord creation/move/overwrite and shared setup callers | Audit before filesystem movement |
| 2 | Role quick-action mutation | Permission/hierarchy and reply coupling | Dedicated role-flow preparation |
| 3 | Welcome channel resolution and DM delivery | Cache/fetch/fallback/swallowed delivery failure | Welcome final closure preparation |
| 4 | Button dispatch | Custom ID, role, lookup, and legacy dispatcher coupling | Interaction preparation |
| 5 | OpenAI text generation | Runtime client/prompt/fallback/error ownership | AI boundary preparation |

Filesystem ownership is architectural debt but is not rank #1: its reader and
persistence consumers are stable, while direct Discord setup has a wider change radius.
