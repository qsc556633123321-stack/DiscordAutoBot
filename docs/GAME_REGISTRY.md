# Game Registry

遊戲語意身份由 `src/domain/games` 提供。

- Alias 只用於辨識，不覆蓋 display name。
- `VALORANT`、`特戰`、`特戰英豪` 是同一 game ID。
- 遊戲子頻道統一為聊天、找隊友、資訊、建立語音。
- 動態遊戲預設放玩家遊戲區。
- 熱門遊戲由 registry tier 控制。

```text
/setup-game
/suggest-game
/fix-game-category
/game-registry-doctor
```
