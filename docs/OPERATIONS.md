# Operations

## Recommended Startup

```bash
npm install
npm run deploy
npm start
```

## Architecture Checks

```bash
npm run test:architecture
npm run audit:commands
```

Discord 內可使用：

```text
/dev-audit-commands
```

## Safe Community Rebuild

先執行 `/rebuild-community-v3 mode:preview`，確認後再使用 execute。V3 不刪除頻道或訊息，非目標頻道移入舊頻道封存。
