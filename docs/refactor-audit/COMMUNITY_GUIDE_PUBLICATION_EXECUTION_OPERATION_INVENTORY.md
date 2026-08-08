# Community Guide Publication Execution Operation Inventory

| ID | Operation | Exact owner | Side effect / next step | Failure / blocker |
| --- | --- | --- | --- | --- |
| GE-O01 | build Guide payload | `setupCommunityGuide` | pure payload before lookup | payload construction can reject |
| GE-O02 | fetch tracked message | `channel.messages.fetch` | fetch only for truthy ID, non-force | rejection becomes null then send |
| GE-O03 | select existing message | local `message` | decides edit vs send | no separate owner |
| GE-O04 | edit existing | `message.edit(payload)` | then persist same message ID | rejection propagates; no write/send |
| GE-O05 | send new | `channel.send(payload)` | then read returned `message.id` | rejection propagates; no write |
| GE-O06 | read message ID | `message.id` | feeds persistence patch | missing/null result throws |
| GE-O07 | persist Guide ID | `saveOnboarding` | full-root JSON writer | writer failure is swallowed internally |
| GE-O08 | Guide completion | setup command caller | later command may start Roadmap | no transaction |
| GE-O09 | Roadmap execution | command caller | separate `setupRoadmapPanel` | Guide is already published/persisted |
| GE-O10 | Roadmap persistence | Roadmap runtime | separate shared writer | not Guide-owned |
| GE-O11 | interaction response | command caller | success `editReply` | outside direct function |
| GE-O12-GE-O15 | propagation/retry/repeat/force | legacy runtime | no retry/lock; force sends | duplicate risk after unpersisted send |
