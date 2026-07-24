# Community Mutation Side-effect Audit

This audit separates observable writes from planning/diagnostic reads. A
best-effort write is still a runtime side effect even when its failure is
swallowed.

| Side-effect ID | Exact runtime source/function | Trigger entries | Read preconditions | Discord write | Data write | Authorization/guard | Error and retry behavior | Partial-failure consequence | Consumer / proposed owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SE-G01 | `systems/communityConcierge.js:getOrCreateCategory` | setup/refresh Guide; rebuild refresh | guild cache lacks named category | category create | none | command `ManageChannels`; bot channel permission implicit | propagates; no retry | category persists without guide channel | Guide mutation |
| SE-G02 | `communityConcierge.js:getOrCreateGuideChannel` | setup/refresh Guide | guide channel absent/wrong parent | text create; parent move; overwrite set | none | channel editable/template available | propagates; no retry | move can succeed before overwrite fails | Guide mutation |
| SE-G03 | `communityConcierge.js:setupCommunityGuide` | setup/refresh Guide | onboarding record/message fetch | message edit or send | onboarding guide channel/message record | command authorization | missing fetch becomes null; send/edit can fail | untracked duplicate after send-before-save | Guide mutation |
| SE-G04 | `communityConcierge.js:setupRoadmapPanel` | setup/refresh Guide | roadmap record/message fetch | message edit or send | roadmap channel/message record | command authorization | same as guide | untracked roadmap message | Guide mutation |
| SE-C01 | `communityConcierge.js:maybeAddRole` | concierge games/invest/dev buttons | role exists, bot hierarchy editable | `member.roles.add` | none | bot `ManageRoles`; target editable | add failure swallowed | reply can claim limited state after no assignment | Roles / Concierge |
| SE-C02 | `communityConcierge.js:sendConciergeWelcome` | guildMemberAdd | guide channel resolve | member DM | none | member accepts DM | failure swallowed; no retry | member receives no guide link | Onboarding |
| SE-P01 | `legacy/systemRuntimes/channelPanelsRuntime.js` record lifecycle | setup panels; rebuild/proposal refresh | channel target/record/message ownership | tracked message edit/send/delete | panel record update/remove | command guard; force only tracked bot message | per-channel catches; no queue | record/message divergence | Panels |
| SE-R01 | `systems/roleManager.js` setup/select helpers | setup roles; role select | configured role/hierarchy | role create/update; member add/remove | mapping/settings where configured | `ManageRoles`, hierarchy | queue/retry only in guest cleanup | role exists but mapping/visibility not synced | Roles |
| SE-O01 | `systems/welcomeSystem.js` member handler | guildMemberAdd | guest role/settings/channel | guest role create/add; welcome send | reminder/settings state | bot/hierarchy/MemberGuard guards | phase-local catches; no retry | guest status without welcome/reminder | Onboarding |
| SE-Q01 | `gameSuggestionSystemRuntime.js:createGameSuggestion` | proposal modal/slash | suggestion channel available | card send | pending proposal/message ID | valid input | defer/edit; no transaction retry | record and card can diverge | Proposals |
| SE-Q02 | `gameSuggestionSystemRuntime.js:handleVote` | support/oppose buttons | pending proposal | card edit | voter arrays | proposal state | dispatcher catches; no retry | JSON vote visible only after later edit | Proposals |
| SE-Q03 | `gameSuggestionSystemRuntime.js:approveSuggestion` | approve button | pending proposal; `ManageChannels`; identity lookup | category/children/overwrites; card/log sends | proposal approval; game/create-entry metadata | moderator/bot channel permissions | delayed child operations; secondary refresh best effort | approved record with incomplete game area | Proposals |
| SE-Q04 | `gameSuggestionSystemRuntime.js:rejectSuggestion` | reject modal | pending proposal/reason | card edit; log send | rejection status/reason | `ManageChannels` | no retry | record changed before card/log failure | Proposals |
| SE-B01 | bootstrap/V3 ensure helpers | bootstrap/rebuild confirmations | architecture, registry, cache | category/channel create/move/rename | layout registry | privileged plan + bot perms | queue/helper-specific retries | partially built canonical layout | Bootstrap |
| SE-B02 | V3/role setup helpers | bootstrap/rebuild confirmations | role design/cache | role create/edit | role map | hierarchy/non-managed role | per-operation catch | roles changed before permissions | Bootstrap / Roles |
| SE-B03 | permission executor | apply/repair/rebuild confirmations | matrix, categories, role IDs | overwrite set/edit | plan/log results | `ManageChannels` + bot perms | writer-specific retry | parent/child visibility divergence | Permission maintenance |
| SE-M01 | plan executors | cleanup/dedupe/rebuild/reset/reorganize confirmations | protected metadata, plan owner | rename/move/delete category/channel | plan/registry cleanup/logs | confirmation, limits, protected checks | per-action failures continue | destructive prefix completed | Maintenance |
| SE-M02 | `systems/serverLogs.js:writeServerLog` | most mutation paths | server-log channel | log message send | none | log channel permission | swallowed/caught | audit trail missing, operation remains | Cross-cutting |
| SE-V01 | `legacy/events/channelDelete.js` -> Temp Voice | channelDelete | temp voice metadata | LFG/control/hub updates where applicable | stale voice records removal | event/bot permissions | caught; startup can reconcile | voice state may remain stale until ready | Voice (excluded) |

## Non-mutation observations

- `/layout-doctor` and `/plan-cleanup` calculate and reply only; they do not
  enter the mutation table as write owners.
- `concierge_night`, `concierge_bot`, and `concierge_roadmap` reply ephemerally
  but do not alter Discord state or local records.
- No active Community mutation route was confirmed in `apps/api/server.js`.
- Optional OpenAI text generation is read/content generation, not an ownership
  change to Community Discord resources.
