# Server Governance Production Review

Status: `SERVER_GOVERNANCE_V12_REVIEW_READY_NOT_DEPLOYED`.

This is a local, production-shaped, read-only review fixture based on the
observed preview totals. It is not a live Discord scan and does not authorize
or perform any Discord mutation.

## Preview Totals

| Current | Desired | Keep | Create | Move | Rename | Permission | Safe delete | Review delete | Review | Conflict | Protected |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 132 | 59 | 50 | 6 | 0 | 3 | 3 | 0 | 12 | 67 | 0 | 0 |

All 79 review actions remain `UNDECIDED`; preflight is blocked with
`UNAPPROVED_REVIEW_ACTIONS`, and dry-run writes remain zero.

## Review Resolution

| Reason | Count | Recommendation |
| --- | ---: | --- |
| Legacy compact-game split layout | 6 | Migrate into the canonical combined `聊天與找隊友` channel after human review |
| Legacy channel outside voice-only layout | 6 | Delete only after human review |
| User-managed / unknown resource | 67 | Ignore governance until a future explicit approval exists |

Review resource types are 12 categories, 62 text channels, and 5 voice
channels. The preview now displays each resource's ID, parent, identity,
purpose, ownership, lifecycle, reason, recommendation, and approval state.

## Deterministic Work

The three canonical compact game channels can be renamed to their emoji
display names and reconciled to their game-specific access profiles. The six
missing desired resources are `channel:dev`, `channel:invest`,
`channel:creator`, `channel:night`, `channel:bot_logs`, and
`channel:moderation`; no deterministic existing resource is adopted for any
of them. No channel is archived and no resource is auto-deleted.

Runtime voice and ticket protection is still verified separately by regression
coverage. This observed fixture has zero protected actions; that number does
not weaken the protection policy.
