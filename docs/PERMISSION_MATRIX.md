# Permission Matrix

Community V4 Lite 的唯一權限來源是
`src/domain/community/permissionMatrix.js`。Command 不得自行定義權限。

## Role Inheritance

`👤 正式成員`是基礎身份。以下特殊身份必須自動繼承正式成員可見性：

| 特殊身份 | 繼承 |
| --- | --- |
| 🎮 遊戲玩家 | 👤 正式成員 |
| 🤖 AI開發 | 👤 正式成員 |
| 📈 股票投資 | 👤 正式成員 |
| 🎨 創作者 | 👤 正式成員 |
| 🌙 Night Crew | 👤 正式成員 |

Discord 不會自動繼承角色，因此 Permission Builder 會在正式成員可見分類中，同時允許上述特殊身份。

## Category Visibility

| Category key | 可見身份 |
| --- | --- |
| `entry` | `@everyone`、訪客 |
| `lobby` | 正式成員與其衍生身份 |
| `game_center` | 正式成員與其衍生身份 |
| `popular_games` | 遊戲玩家 |
| `player_games` | 遊戲玩家 |
| `dynamic_game` | 遊戲玩家 |
| `interests` | 正式成員與其衍生身份 |
| `events` | 正式成員與其衍生身份 |
| `admin` | 站長、管理員、MOD、Bot |

## Cleanup Policy

Community V4 Lite 停用 archive。空白、重複、孤兒項目經確認後直接清理；受保護頻道、系統頻道、Ticket、Temp Voice 不得刪除。

## Verification

```bash
npm run test:permissions
```
