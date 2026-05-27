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
- `/polish-server-design`：預覽或二次確認後統一社群分類、頻道名稱、身分組配色、hoist、排序與 Discord 原生功能提示。
- `/cleanup-empty-categories`：預覽或確認清理空分類。
- `/restore-active-channels`：把誤封存的有效頻道移回正確分類。

保護規則：不刪 ticket- 頻道、不刪臨時語音、不刪執行指令頻道；美食分享、音樂分享、閒聊討論、一般聊天與 `apex-`、`tft-`、`lol-`、`mc-`、`特戰-` 開頭頻道視為有效頻道。

`/polish-server-design` 的 `preview` 不會修改伺服器；`execute` 會先顯示確認按鈕。Discord 原生功能中 Membership Screening、Verification Level、Server Guide、Forum / Media Channel 多數需要在 Discord Server Settings 手動設定，Bot 會在 preview / 完成摘要列出建議清單。

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
- Member Guard 相關指令與訪客批次清理都有 Discord interaction timeout protection：進入指令會先 `deferReply`，長操作與確認按鈕會用 `editReply` / `deferUpdate` 更新進度，避免「該申請未受回應」。

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

## Temp Voice Auto Repair

- Temp Voice 建立入口不再只靠頻道名稱判斷，Bot 會用 `src/data/temp-voice-create-entries.json` 記錄 create entry metadata。
- `/setup-game` 與 `/fix-game-category` 會自動註冊 `➕｜建立XXX語音` 的 channelId、game、分類資訊。
- Bot 啟動時會掃描所有名稱包含「建立」與「語音」的語音入口，缺 metadata 會自動修復。
- 加入入口語音時 console 會輸出 `[TempVoice Debug]`，包含 channelId、channelName、category、isCreateEntry、createTempVoice called。
- `/tempvoice-doctor` 可掃描 create entry、metadata、room registry、Voice Hub sync，並自動補齊缺少的 create entry metadata。
- 若 Member Guard 阻擋訪客或安全模式使用者建立語音，Bot 會把使用者移出入口語音並嘗試私訊原因；voiceStateUpdate 事件本身無法發 ephemeral 訊息。

## Voice Activity & Social Retention System

- 新增語音活躍紀錄：累積語音、本週、本月、開房次數、Temp Voice 建立次數、深夜語音、最愛遊戲、最常一起語音成員。
- 新增 `/voice-profile`：查看個人語音檔案、語音稱號與 AI/fallback 氣氛文字。
- 新增 `/voice-leaderboard`：支援本週語音、本月語音、開房次數、深夜語音、熱門房主排行榜。
- 新增 `/voice-status`：查看目前語音社群狀態與活躍摘要。
- 新增 `/voice-room-info`：查看目前語音房房主、遊戲分類、人數、活躍時長與熱門程度。
- Voice Hub 會顯示房間活躍時間與標籤，例如 `🔥 熱門房間`、`🌙 深夜常駐聚集地`。
- 語音稱號只做顯示，不建立 Discord Role：`🌙 深夜常駐`、`🎮 開房達人`、`🎤 語音怪`、`👑 社群核心`、`🔥 熱門房主`。
- 若設定 `OPENAI_API_KEY`，Bot 會嘗試產生短版社群氣氛文案；失敗或未設定時自動使用固定 fallback。
- 效能設計：voiceStateUpdate 只更新記憶體 session，`src/data/voice-activity.json` 每 60 秒批次寫入一次，關閉程序前會嘗試保存。
- 隱私設計：不記錄語音內容、麥克風、聊天內容，只記錄時間、房間、人數與共同語音關係。
- 防掛機：AFK 頻道不計算、Bot 不計算、一人語音不計算，至少兩位非 Bot 成員同房才開始累積。

## Dynamic Community Expansion System

- 新增動態社群結構設定：入口、大廳、遊戲中心、Night Crew、創作開發、投資討論、管理後台。
- 新增 `/suggest-game game_name reason`：玩家可提議新增遊戲分類，Bot 會在 `📋｜遊戲提議` 發送提議卡。
- 提議卡支援 `👍 支持`、`👎 反對`、`✅ 管理員批准`、`❌ 管理員拒絕`。
- 管理員批准後會建立 `🎮｜遊戲名`，並建立聊天、找隊友、資訊、建立語音入口。
- 動態建立的語音入口會自動註冊 Temp Voice metadata，可接入 Temp Voice、LFG、Voice Hub。
- 管理員拒絕會跳出 Modal 輸入理由，提議卡會更新為已拒絕。
- 新增 `/archive-inactive-games`：掃描動態遊戲分類，14 天無明顯文字活動且沒有 active voice 時移到遊戲封存區；只封存不刪除。
- 新增 Night Crew：深夜 00:00-05:00 語音累積超過 20 小時，自動解鎖 `🌙 Night Crew`，可見 Night Crew 分類。
- Night Crew 只提供社群身份感與可見性，不給管理權限。
- 若設定 `OPENAI_API_KEY`，遊戲提議卡會嘗試產生短版社群氛圍文案；API 失敗會使用 fallback。
- 防頻道爆炸：遊戲分類必須先由玩家提議、再由管理員批准；建立頻道採逐步 queue delay，不使用大量 Promise.all；低活躍遊戲只封存不刪除。

## AI Community Concierge & Interactive Onboarding

- 新增 `/setup-community-guide`：建立 `🧭｜伺服器導覽` 與 `🚧｜社群開發日誌` persistent panels。
- 新增 `/refresh-community-guide`：重用既有 messageId 編輯導覽與 Roadmap，不洗版。
- 新增 `/community-about`：用社群管家語氣說明這個群是做什麼的。
- 新增 `/community-roadmap`：顯示已完成、開發中、未來計畫，語氣偏「一起打造社群」。
- 新增 `/help-me-start`：用遊戲、偏好、上線時間推薦頻道、身分組與開始路線。
- 導覽面板按鈕包含：我想玩遊戲、深夜聊天、BOT 功能、投資、AI/開發、社群未來規劃。
- 導覽按鈕皆使用 ephemeral 回覆，不公開洗頻；遊戲/投資/開發入口會在權限允許時嘗試直接加入對應身分組。
- 新人加入時會在原本 Welcome System 外，額外嘗試 DM 互動導覽與 `/help-me-start` 提示；DM 失敗不影響流程。
- Voice Hub 顯示新增房間氛圍標籤：`🔥 熱門房間`、`🌙 深夜閒聊`、`🎯 認真上分`、`🛋 輕鬆聊天`、`🎧 新手可加入`。
- 若設定 `OPENAI_API_KEY`，導覽主文案與 `/help-me-start` 會嘗試產生自然的社群管家文字；失敗或未設定時使用 fallback。
- Discord 原生 Community Onboarding、Server Guide、Welcome Screen 目前需到 Discord Server Settings 手動設定；Bot 會提供可用頻道與導覽內容。
- 避免資訊過載：新人先看導覽 Panel，再用按鈕分流到遊戲、投資、AI/開發、深夜聊天室，不需要一次看完整頻道樹。
