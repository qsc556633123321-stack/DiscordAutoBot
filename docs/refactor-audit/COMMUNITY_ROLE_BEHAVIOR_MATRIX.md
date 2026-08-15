# Community Role Behavior Matrix

| customId | Role intent | Lookup | Mutation | Result to UI |
| --- | --- | --- | --- | --- |
| `concierge_games` | `🎮 遊戲玩家` | guild role cache by exact name | add only | success/failure text in ephemeral embed |
| `concierge_invest` | `📈 股票投資` | guild role cache by exact name | add only | success/failure text in ephemeral embed |
| `concierge_dev` | `🛠 開發/AI` | guild role cache by exact name | add only | success/failure text in ephemeral embed |
| `concierge_night`, `concierge_bot`, `concierge_roadmap` | none | none | none | ephemeral embed |
| unknown | none | none | none | returns `false` |

The current action is not a toggle. Already-assigned members still invoke
`member.roles.add`; role absence, missing management permission, a non-editable
role, or insufficient hierarchy returns `false`. An add rejection is swallowed
by `.catch(() => null)` and still returns `true` from `maybeAddRole`.
