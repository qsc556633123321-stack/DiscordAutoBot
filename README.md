# Discord Community OS Bot

Discord.js v14 社群管理 Bot，包含伺服器模板、Ticket、Channel Panels、身分組權限、Temp Voice、整理工具、AutoMod 與 Dashboard MVP。

## 安裝

```bash
npm install
copy .env.example .env
npm run deploy
npm start
```

`.env` 至少需要：

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_test_guild_id_here
OPENAI_API_KEY=
```

Bot 建議權限：Manage Roles、Manage Channels、View Channels、Send Messages、Embed Links、Read Message History、Manage Messages、Move Members。不要預設使用 Administrator。

## 指令總覽

### 基礎管理

- `/setup-server`：依模板建立伺服器基礎分類、頻道、角色與規則 Embed。
- `/announce`：管理員發送公告。
- `/lock`：鎖定目前頻道。
- `/unlock`：解鎖目前頻道。
- `/setup-ticket`：建立客服 Ticket 入口與 logs。
- `/setup-channel-panels`：建立、刷新或強制重發各頻道公告面板。

### 新人系統

- `/welcome-settings`：設定新人歡迎、DM、訪客角色與提醒。
- 新人加入後會在新人報到頻道顯示歡迎 Embed，DM 失敗不會中斷流程。
- 10 分鐘未領身分組提醒只會提醒一次。

### 身分組權限

- `/setup-roles`：建立自助領取身分組，重複執行不會重複建立。
- `/role-settings`：設定領取正式身分組後是否移除「訪客」，以及取消所有正式身分組後是否恢復「訪客」。
- `/cleanup-guest-roles mode:preview|execute`：批次清理已領正式身分組但仍保留「訪客」的既有成員。
- `/apply-role-permissions mode:preview`：預覽身分組與分類可見性規則。
- `/apply-role-permissions mode:execute`：二次確認後套用分類權限。
- Panel 的「領取身分組」按鈕會直接開啟 Select Menu；選完後會提示已解鎖哪些分類，並依設定自動移除「訪客」身分組。
- `/cleanup-guest-roles` 內建 Discord API rate limit protection：只 fetch 成員一次，角色移除會排隊逐筆執行，每次間隔約 1.2-1.8 秒，遇到 rate limit 會依 retry_after 重試一次。
- 批次清理每次最多處理 200 位成員；若超過上限，剩餘成員會略過並可再次執行清理。

公開可見：社群入口、公開大廳、一般聊天、新人報到、規則、公告、客服支援。遊戲、投資、開發分類依身分組解鎖；管理員後台只給管理員、站長與 Bot。

### 遊戲語音

- `/setup-game`：建立指定遊戲分類與預設頻道。
- `/fix-game-category`：把指定遊戲頻道移回正確分類。
- `/create-party`：建立臨時組隊語音。
- `/tempvoice-panel`：重新取得自己的臨時語音控制台。
- `/tempvoice-settings`：設定房主轉移、空房刪除時間、控制台與結束清理模式。
- `/setup-voicehub`：建立或指定 `🎮｜目前語音房`，固定顯示目前活躍臨時語音房。

Temp Voice 2.0 會優先用 ephemeral 或 DM 提供房主控制台；DM 失敗才 fallback 到 `🔒｜語音控制台`。房間結束後控制台會依 `cleanup_mode` 失效、刪除或保留。

Voice Hub 會固定編輯同一則訊息，不洗版；建立房間、刪除房間、房主轉移、人數變化、改名與人數限制變更時會自動 debounce 更新。

LFG 招募卡會在 `📢｜組隊招募` 自動發送，其他成員可按「加入語音」直接加入公開且未滿的 Temp Voice，或按「查看房間」看房主、建立時間、狀態與人數。LFG 招募卡會在房間關閉後先 disabled 按鈕，約 10 秒後自動刪除，不保留已結束訊息。

### 整理工具

- `/analyze-server`：分析伺服器結構。
- `/plan-cleanup`：產生整理方案但不執行。
- `/auto-organize`：預覽並確認後搬移高信心頻道。
- `/deep-cleanup`：預覽並二次確認後執行深度整理。
- `/rebuild-server`：預覽並二次確認後重建模板。
- `/factory-reset-server`：高風險工廠重置，必須 preview 與二次確認。
- `/ai-reorganize-server`：AI 輔助重整計畫，AI 只建議，不直接刪除。
- `/cleanup-empty-categories`：預覽或確認清理空分類。
- `/restore-active-channels`：把誤封存的有效頻道移回正確分類。

保護規則：不刪 ticket- 頻道、不刪臨時語音、不刪執行指令頻道；美食分享、音樂分享、閒聊討論、一般聊天與 `apex-`、`tft-`、`lol-`、`mc-`、`特戰-` 開頭頻道視為有效頻道。

### Dashboard

Dashboard 前端在 `apps/web`，Express API 在 `apps/api`。

```bash
npm run dashboard:dev
npm run api:dev
```

或同時啟動：

```bash
npm run dev
```

本機網址：

```text
Dashboard: http://localhost:3000
API: http://localhost:4000
OAuth Redirect: http://localhost:4000/auth/discord/callback
```

### AutoMod

- `/automod-settings`：設定防洗版、防邀請、防可疑連結、防大量 mention 與 timeout 時間。

AutoMod 會略過 Bot、管理員、白名單角色與 Ticket 頻道。

### Link Guard

- `/linkguard-settings`：設定惡意連結防護、Discord 邀請封鎖、短網址封鎖、新帳號 timeout 與連結洗版門檻。
- `/linkguard-whitelist action:add type:domain value:example.com`：新增允許網域。
- `/linkguard-whitelist action:remove type:domain value:example.com`：移除允許網域。
- `/linkguard-whitelist action:list type:domain`：查看目前白名單。
- `/linkguard-whitelist action:add type:invite value:invitecode`：允許指定 Discord 邀請碼。

建議設定：

```text
/linkguard-settings enabled:true block_invites:true block_shorteners:true new_account_days:7 new_account_timeout_minutes:10 link_spam_limit:3
```

Link Guard 會刪除高風險連結、短網址、可疑 Discord/Steam/Nitro/Login/Verify 仿冒網域；新帳號 7 天內發外部連結會刪除並 timeout。所有阻擋紀錄會寫入 `📑｜server-logs`。

### Member Guard

- `/memberguard-settings`：設定新人安全防護、訪客隔離、新帳號限制、mention guard、join burst 與 safe mode。
- `/memberguard-status`：查看 Member Guard 啟用狀態、safe mode、最近加入人數與最近阻擋次數。
- `/memberguard-release`：管理員手動解除某位成員的訪客限制。

建議公開招生前設定：

```text
/memberguard-settings enabled:true guest_lockdown:true new_account_days:7 new_account_timeout_minutes:10 block_everyone_mentions:true block_role_mentions:true join_burst_limit:10 join_burst_window_seconds:60 safe_mode:false
```

招生前安全檢查流程：先執行 `/setup-roles` 與 `/apply-role-permissions mode:execute`，再開啟 `/memberguard-settings`，確認訪客只能看到入口、規則、身分組領取、導覽與客服支援。safe mode 開啟時，訪客與新帳號不能發外部連結、不能開臨時語音、不能使用 LFG 加入按鈕，Link Guard 會進入嚴格模式。

## 建議初始化流程

1. `npm run deploy` 重新部署 slash commands。
2. `/setup-server` 或 `/rebuild-server mode:preview` 檢查目標架構。
3. `/setup-roles` 建立自助身分組。
4. `/apply-role-permissions mode:preview` 檢查權限計畫。
5. `/apply-role-permissions mode:execute` 套用可見性。
6. `/setup-ticket` 建立客服系統。
7. `/setup-game` 建立主要遊戲分區。
8. `/setup-channel-panels mode:force target:all` 發送完整公告面板。
9. `/tempvoice-settings` 檢查臨時語音設定。
10. `/welcome-settings` 開啟新人歡迎與提醒。
11. `/memberguard-settings enabled:true guest_lockdown:true new_account_days:7 new_account_timeout_minutes:10 block_everyone_mentions:true block_role_mentions:true join_burst_limit:10 join_burst_window_seconds:60 safe_mode:false` 開啟新人安全防護。
12. `/automod-settings` 開啟基礎防護。

## 穩定性補強

- 重要操作會嘗試寫入 `📑｜server-logs`，找不到會自動建立；log 失敗不影響主流程。
- Bot 啟動後會清理不存在的 temp voice 死資料，並為空房排程刪除。
- 長操作使用 defer 或二次確認，避免直接執行高風險變更。
