# Discord Community OS Bot

Discord.js v14 社群管理 Bot，為「科幻基地」提供 Community Architecture V3、遊戲找隊友、Temp Voice、社群安全、互動導覽與管理工具。

Project Architecture V2 採漸進式重構：新功能依照 `core -> domain -> services -> infrastructure` 分層，既有功能透過 legacy adapters 保持相容。

## 安裝

```bash
npm install
```

建立 `.env`：

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
OPENAI_API_KEY=
```

## 快速啟動

```bash
npm run deploy
npm start
```

Dashboard：

```bash
npm run api:dev
npm run dashboard:dev
```

## 常用指令

- `/rebuild-community-v3`：預覽或執行 Community Architecture V3。
- `/repair-channel-permissions`：修復 Guest Gate 與分類權限。
- `/check-guest-visibility`：檢查新人視角是否外漏。
- `/community-architect`：診斷社群結構。
- `/setup-channel-panels`：建立或刷新頻道面板。
- `/setup-game`：建立遊戲分類。
- `/dev-audit-commands`：檢查文件與 slash commands 是否一致。

## 架構與操作文件

- [Project Architecture V2](docs/ARCHITECTURE.md)
- [Commands](docs/COMMANDS.md)
- [Community Architecture V3](docs/COMMUNITY_V3.md)
- [Permissions](docs/PERMISSIONS.md)
- [Game Registry](docs/GAME_REGISTRY.md)
- [Security](docs/SECURITY.md)
- [Voice System](docs/VOICE_SYSTEM.md)
- [Operations](docs/OPERATIONS.md)
- [Refactor Audit](docs/REFACTOR_AUDIT.md)

## 驗證

```bash
npm run test:architecture
npm run audit:commands
```
