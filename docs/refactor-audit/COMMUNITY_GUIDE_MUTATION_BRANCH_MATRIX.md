# Community Guide Mutation Branch Matrix

`Not Applicable` means the current production runtime has no branch or API call
for that condition. It is not an instruction to implement it. Dynamic message,
channel and timestamp values are normalized by the frozen fixture.

| Branch | Entry | Initial Discord / JSON state | Action and expected call order | JSON / response / error | Partial state, retry and duplicate risk | Baseline |
| --- | --- | --- | --- | --- | --- |
| G-B01 Existing category | setup/refresh | category lookup returns category | no category create | unchanged until publish | reuse by name; no retry | Channel Ensure |
| G-B02 Missing category | setup/refresh | no matching category | `category.create` before guide channel work | no record before message | category persists if later step fails | Channel Ensure |
| G-B03 Existing guide channel | setup/refresh | matching text channel | no guide channel create; overwrite set | normal message branch follows | reused name can select existing resource | Existing Refresh |
| G-B04 Missing guide channel | setup/refresh | no matching text channel | category create (if needed) -> `guide.channel.create` -> overwrite set | record only after message | created channel persists if send fails | Channel Ensure |
| G-B05 Channel under wrong parent | setup/refresh | guide parent differs | `guide.channel.setParent` -> overwrite set | normal message branch follows | move can persist before later failure | Channel Ensure |
| G-B06 Channel wrong position | setup/refresh | any raw position | Not Applicable: no `setPosition` call | no response difference | no position repair/retry | Channel Ensure static assertion |
| G-B07 Permission already correct | setup/refresh | overwrite may already match | Not Applicable: runtime does not compare; always `overwrite.set` | normal message branch follows | overwrite still attempted | Channel Ensure |
| G-B08 Permission overwrite required | setup/refresh | any guide channel | `guide.overwrite.set` before payload/message | no dedicated record | rejection is swallowed; publication continues | Channel Ensure / Partial Failure |
| G-B09 Tracked Guide message exists | setup/refresh | `guideMessageId` present and fetch resolves | overwrite -> fetch -> edit -> write | record re-saved with same ID | no send/duplicate | Existing Refresh |
| G-B10 No tracked Guide message | setup/refresh | no `guideMessageId` | overwrite -> send -> write | new guide IDs stored | send-before-write window | New Publish |
| G-B11 Guide fetch succeeds | setup/refresh | tracked ID and message | one fetch then edit | record patch after edit | no retry required | Existing Refresh |
| G-B12 Guide fetch fails | setup/refresh | tracked ID; fetch rejects | fetch catch -> send -> write | replacement ID attempted | old message can remain; duplicate risk | New Publish |
| G-B13 Guide edit succeeds | setup/refresh | fetched message | edit -> write | tracked ID retained | repeat refresh edits again | Existing Refresh |
| G-B14 Guide edit fails | setup/refresh | fetched message; edit rejects | edit rejects; no send/write | command outer error path | no fallback/retry | Existing Refresh |
| G-B15 Guide send succeeds | setup/refresh | no usable tracked message | send -> write | generated ID/channel ID stored | retry can edit only if write succeeded | New Publish |
| G-B16 Guide send fails | setup/refresh | no usable tracked message | send rejects; no write | command outer error path | no record or retry loop | New Publish |
| G-B17 Guide persistence succeeds | setup/refresh | send/edit completed | `onboarding.write` | merged guild record, unrelated fields retained | repeat can use tracked ID | Persistence |
| G-B18 Guide persistence fails | setup/refresh | send/edit completed; write rejects | write error swallowed | function resolves; record unchanged | next run can publish duplicate | New Publish / Persistence |
| G-B19 Tracked Roadmap message exists | direct roadmap or command after Guide | `roadmapMessageId` fetch resolves | fetch -> edit -> write | roadmap record re-saved | no roadmap send | Mutation Order |
| G-B20 No tracked Roadmap message | direct roadmap or command after Guide | no ID or null fetch | send -> write | new roadmap IDs stored | send-before-write window | Existing characterization / Order |
| G-B21 Roadmap fetch succeeds | roadmap publish | tracked ID/message | one fetch then edit | record patch after edit | no local retry | Mutation Order |
| G-B22 Roadmap fetch fails | roadmap publish | tracked ID; fetch rejects | fetch catch -> send -> write | replacement ID attempted | old panel may remain | Existing characterization |
| G-B23 Roadmap edit succeeds | roadmap publish | fetched message | edit -> write | tracked ID retained | repeat edits again | Mutation Order |
| G-B24 Roadmap edit fails | roadmap publish | fetched message; edit rejects | rejects; no send/write | direct caller rejects | no fallback | Required baseline: partial |
| G-B25 Roadmap send succeeds | roadmap publish | no usable tracked message | send -> write | new roadmap IDs stored | untracked if write fails | Existing characterization |
| G-B26 Roadmap send fails | roadmap publish | no usable tracked message | rejects; no write | direct caller rejects | no retry | Required baseline: partial |
| G-B27 Roadmap persistence succeeds | roadmap publish | send/edit completed | `onboarding.write` | merged roadmap keys | later refresh can fetch | Mutation Order |
| G-B28 Roadmap persistence fails | roadmap publish | send/edit completed; write rejects | write swallowed | function resolves, published panel untracked | duplicate risk | Partial Failure |
| G-B29 Guide succeeds, Roadmap fails | setup/refresh command | Guide complete; Roadmap operation rejects | Guide write then Roadmap failure | direct command has no success editReply | Guide remains published | Command / Partial Failure |
| G-B30 Category created, channel create fails | setup/refresh | category absent; channel create rejects | category.create -> guide.channel.create reject | no record | category remains; re-run reuses it | Partial Failure |
| G-B31 Channel created, permission fails | setup/refresh | guide created; overwrite rejects | create -> overwrite catch -> send -> write | record still written | partially configured channel remains | Channel Ensure / Partial Failure |
| G-B32 Channel ready, Guide send fails | setup/refresh | ensured channel; send rejects | ensure -> send reject | no record | channel remains for retry | Partial Failure |
| G-B33 Guide send succeeds, JSON write fails | setup/refresh | send resolves; write rejects | send -> write catch | no guide ID persisted | retry sends again if no tracked ID | New Publish / Persistence |
| G-B34 Retry after unpersisted Guide send | re-run command | successful prior send, record absent | same send path | new message ID attempted | duplicate is possible and current behavior | New Publish documentation |
| G-B35 Retry after partial channel setup | re-run command | category/channel may already exist | reuse existing resource then publish | record depends on publish | no rollback; name/cache matching | Channel Ensure documentation |
| G-B36 Setup authorization failure | `/setup-community-guide` | caller lacks ManageChannels | defer -> authorization `editReply`; no delegation | no Discord/data mutation | deterministic, no retry | Setup Command |
| G-B37 Refresh authorization failure | `/refresh-community-guide` | caller lacks ManageChannels | defer -> authorization `editReply`; no delegation | no Discord/data mutation | deterministic, no retry | Refresh Command |
| G-B38 Malformed JSON | setup/refresh | onboarding file malformed | read catches -> fallback -> send/edit branch -> write | error logged; new merged state written if write works | prior malformed content replaced by current writer | Persistence |
| G-B39 Missing JSON | setup/refresh | file absent | ensure writes fallback -> read -> publish -> patch write | initialization then record write | two writes; no atomic lock | Persistence |
| G-B40 Repeated/concurrent invocation | any | overlapping calls | Not Applicable: no invocation lock/queue | independent reads/writes | last write and duplicate-publication risk are unmitigated | static contract |

## Notes

- Current `setupCommunityGuide` does not create/update Roadmap itself; the two
  slash commands call Roadmap immediately after a successful Guide operation.
- Bootstrap/V3 verified indirect calls invoke Guide refresh only. They do not
  establish a separate Roadmap coupling contract.
