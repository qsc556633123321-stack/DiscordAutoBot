# Project Architecture V2

## Layers

- `src/core`: framework-neutral Result、errors、logger 與共用常數。
- `src/domain`: Community V3、遊戲、安全、語音等純規則。
- `src/services`: 業務流程與 use cases，統一回傳 Result。
- `src/infrastructure`: Discord API、JSON storage、OpenAI、Git 與 logs。
- `src/adapters/legacy`: 舊 commands/systems 接入新版 services 的相容層。
- `src/modules`: Phase 2 起逐步收斂各功能模組。

Commands 只解析 Discord interaction 與參數。Community Architecture V3 是唯一社群結構來源。

所有新版 service 回傳 `{ ok, data, error }` Result。尚未完整遷移的功能透過 `createLegacyFacade().invoke()` 呼叫，避免 legacy exceptions 穿透 service boundary。

## Phase 2 Consolidation

舊 systems 暫時保留為 service 背後的 legacy engines。Commands 不再直接依賴主要 Community、Permission、Game 與 Panel engines。

- `/rebuild-community-v3`
- `/repair-channel-permissions`
- `/check-guest-visibility`
- `/community-architect`
- `/bootstrap-community`
- `/rebuild-community-layout`
- `/polish-server-design`
- `/setup-channel-panels`
- `/setup-game`
- `/fix-game-category`

詳細殘留與 Phase 3 清單請參考 [REFACTOR_AUDIT.md](REFACTOR_AUDIT.md)。
