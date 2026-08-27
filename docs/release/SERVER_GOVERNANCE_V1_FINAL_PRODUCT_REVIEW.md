# Server Governance v1 Final Product Review

## Channel Review
| Key | Channel | Category | Role | Classification | User action / justification |
|---|---|---|---|---|---|
| welcome | 👋｜新人報到 | Entry | Public | ESSENTIAL | Begin onboarding; separate because the welcome runtime targets it. |
| rules | 📜｜社群規則 | Entry | Public read-only | ESSENTIAL | Read enforceable rules. |
| announcements | 📢｜公告 | Entry | Public read-only | ESSENTIAL | Receive durable community and event notices. |
| guide | 🧭｜伺服器導覽 | Entry | Public read-only | ESSENTIAL | Read Kuro guide; cannot merge without changing the existing guide runtime. |
| roles | ✅｜身分組領取 | Entry | Public | ESSENTIAL | Choose access roles. |
| general | 💭｜一般聊天 | Community | Member | ESSENTIAL | One visible everyday conversation; replaces community chat/info/LFG overlap. |
| game_lfg | 📢｜組隊招募 | Game Center | Game | ESSENTIAL | Find players before entering a specific game space. |
| game_suggestions | 📋｜遊戲提議 | Game Center | Game | USEFUL | Request a registry addition. |
| game_database | 🗃｜遊戲資料庫 | Game Center | Game read-only | USEFUL | Read shared game references. |
| dev | 💻｜程式開發 | Interests | Dev/AI | USEFUL | Focused development discussion. |
| invest | 📈｜股票投資 | Interests | Invest | USEFUL | Focused investment discussion. |
| creator | 🎨｜創作分享 | Interests | Creator | USEFUL | Share creative work. |
| night | 🌙｜深夜交流 | Interests | Night Crew | USEFUL | Time-based social discussion. |
| ticket_open | 🎫｜開啟客服單 | Support | Public | ESSENTIAL | Start a private support flow. |
| admin_logs | server-logs | Admin | Bot/admin | ESSENTIAL | Server operational audit stream. |
| bot_logs | bot-logs | Admin | Bot/admin | USEFUL | Separate bot diagnostics. |
| moderation | mod-tools | Admin | Admin | ESSENTIAL | Moderator operational tools. |
| bot_control | bot-control | Admin | Bot/admin | ESSENTIAL | Bot operations control. |

Removed merge candidates: `community_chat`, `community_lfg`, `community_info`,
`game_lobby`, `giveaway`, `polls`, `events`, and `ticket_help`.

## Category Review
- Entry (5): public boundary; all five are independently runtime/onboarding
  meaningful.
- Community (1): member boundary; one channel is justified because it separates
  social discussion from public onboarding and game-only discussion.
- Game Center (3): game-role boundary; shared LFG/proposals/reference remain.
- Interests (4): one shared category with four distinct role-gated interests.
- Support (1): public ticket boundary; ticket flow replaces persistent help.
- Admin (4): admin/bot boundary; logs and operations remain distinct.
- Each game category: a specific-game permission boundary, not a cosmetic
  category; it prevents one game role from exposing another game.

## Density Assessment
| Viewer | Visible categories | Visible persistent channels |
|---|---:|---:|
| Guest | 2 | 6 |
| Member | 4 | 7 |
| Member + Game | 5 | 10 |
| Member + Game + LOL | 6 | 14 |
| Member + Game + LOL + APEX | 7 | 18 |
| Admin | 16 | 43 |

The member-facing experience remains compact; the total does not create an
empty-server effect because specific-game and interest channels are hidden until
their roles are selected.

## Change Table
| Current RC | Final proposal | Impact |
|---|---|---|
| 17 categories / 51 channels | 16 categories / 43 channels | Eight low-overlap channels and the Events category removed from desired state. |
| Community chat, LFG, info | General chat | Social/LFG/info duplication removed; cross-game LFG lives in Game Center. |
| Game lobby | Removed | General chat is the shared lobby; game center remains task-focused. |
| Events category, giveaway, polls, event channel | Announcements + bot interactions | Fewer dormant event channels; no permission widening. |
| Ticket help | Ticket entry | Ticket flow owns help guidance; no ticket lifecycle change. |

No change was made to SAFE_DELETE, UNKNOWN protection, runtime protection,
NO_ARCHIVE, the legacy collision guard, or execution flags.

The Game Center database uses a dedicated game-readonly profile: it remains
read-only without becoming visible to members who have not selected the game
role.
