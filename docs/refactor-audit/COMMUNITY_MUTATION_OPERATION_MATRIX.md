# Community Mutation Operation Matrix

| Operation | Trigger / owner | Reads | Writes / Discord mutation | Dependencies | Idempotency / rollback | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| Ensure Guide channel | setup/refresh Guide | guild channel cache, permission template | category/channel create; channel move; overwrite set | Guide Read, Permission Repair | name-based reuse; created channel can remain after later failure | High |
| Publish Guide payload | setup/refresh Guide | Guide payload, onboarding record | message send or edit; persist message id | Guide Read, Onboarding data | existing ID avoids duplicate when fetch succeeds; send-before-write can duplicate | High |
| Publish Roadmap panel | setup/refresh Guide | Roadmap payload, onboarding record | message send/edit; persist roadmap id | Roadmap Read, Onboarding data | same partial-failure risk | Medium |
| Panel setup/refresh/force | panel command | panel JSON and channel inventory | message send/edit/delete; panel JSON write | Panels, roles, Ticket/Voice buttons | force intentionally deletes tracked bot message | High |
| Bootstrap/rebuild | admin commands | layout config, registry, roles/channels | create/move/delete categories/channels; roles; overwrites; Guide/panel refresh | Layout, Permission Repair, Panels, Guide | ensure helpers reduce duplicates; multi-step partial success | Blocked |
| Self-role setup/select | role command/select | role settings and hierarchy | role create/add/remove; JSON write | Roles, MemberGuard | retry queue for cleanup; hierarchy failure leaves partial state | High |
| Welcome / initial guest | member-add event | welcome settings, channels, roles | guest role create/add, welcome message, DM, reminder state | Onboarding, MemberGuard, Roles | duplicate guard Map; DM failure is swallowed | High |
| Game proposal create/approve/reject | modal/buttons | proposal/game metadata | JSON write, proposal message send/edit, dynamic game channels/overwrites | Proposals, Panels, Voice, Games | duplicate game identity checks; approval can partially create | Blocked |
| Permission repair | confirmation commands | matrix/rules, guild roles/channels | overwrite set/edit/sync | Permission Repair, Guest Gate | plan/confirm workflow; overwrite failure is partial | High |
| Cleanup/destructive maintenance | confirmation commands/events | plans, metadata, protected-resource rules | channel/category delete; plan JSON mutation | Layout, Voice, Ticket, logs | confirmations and limits; irreversible deletes | Blocked |

Guide Status is deliberately absent: there is no runtime consumer or mutation.
