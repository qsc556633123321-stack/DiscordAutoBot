# Permission Matrix

此文件描述 Bug Fix Sprint 1 的唯一權限矩陣。程式來源為
`src/domain/community/permissionMatrix.js`，權限 builder、可見性檢查與測試都必須讀取該矩陣。

## Role Inheritance

| 角色 | 自動繼承 |
| --- | --- |
| 🎮 遊戲玩家 | 👤 正式成員 |
| 🧠 開發/AI | 👤 正式成員 |
| 📈 股票投資 | 👤 正式成員 |
| 🎨 創作者 | 👤 正式成員 |
| 🌙 Night Crew | 👤 正式成員 |

Discord 本身沒有角色繼承功能。Bot 會在身分組選單中補發繼承角色；權限 overwrite
也會直接允許繼承來源角色，讓尚未補發正式成員的既有成員不會被誤擋。

## Category Visibility

| 分類 key | 可見角色 |
| --- | --- |
| `entry` | `@everyone`、訪客 |
| `support` | `@everyone`、訪客 |
| `lobby` | 正式成員與繼承正式成員的角色 |
| `game_center` | 正式成員與繼承正式成員的角色 |
| `popular_games` | 遊戲玩家 |
| `player_games` | 遊戲玩家 |
| `dynamic_game` | 遊戲玩家 |
| `interests` | 正式成員與繼承正式成員的角色 |
| `events` | 正式成員與繼承正式成員的角色 |
| `knowledge` | 開發/AI、股票投資 |
| `night_crew` | Night Crew |
| `admin` | 站長、管理員、MOD、Bot |
| `game_archive`、`old_archive` | 站長、管理員、MOD、Bot |

## Diagnostics

- `/check-role-visibility role:<role>`：比較矩陣預期與 Discord 實際可見性。
- `/debug-permissions channel:<channel>`：顯示分類 key、矩陣角色與實際 overwrite。
- `/repair-channel-permissions mode:execute scope:guest_gate`：修正 Guest Gate 外漏。

## Verification

```bash
npm run test:permissions
```
