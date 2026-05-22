# Discord Server Architect Bot MVP

## AutoMod

啟用或調整社群防護：

```text
/automod-settings spam_enabled: true invite_enabled: true link_enabled: true mention_enabled: true timeout_duration: 5
```

AutoMod 會偵測洗版、大量 mention、Discord invite、可疑短連結、新帳號廣告與重複訊息。管理員、Bot、Ticket 頻道與白名單身分組會被略過。請在 Discord Developer Portal 啟用 Bot 的 `Message Content Intent`，否則 Bot 無法讀取訊息內容。

## 新人互動歡迎

設定新人歡迎系統：

```text
/welcome-settings enabled: true dm_enabled: true auto_guest_role: true reminder_enabled: true
```

新人加入後，Bot 會在 `新人報到` / `welcome` / `報到` 頻道發送歡迎 Embed，提供查看規則、領取身分組、伺服器導覽、需要協助與自我介紹格式按鈕。若可私訊，也會發送簡短引導。請在 Discord Developer Portal 啟用 `Server Members Intent`，並確認 Bot 有 `Manage Roles` 才能自動給予 `訪客` 身分組。

## Factory Reset

Preview first:

```text
/factory-reset-server mode: preview rebuild_template: mixed_community keep_admin: true keep_logs: true remove_roles: false
```

Execute only after checking the preview:

```text
/factory-reset-server mode: execute rebuild_template: mixed_community keep_admin: true keep_logs: true remove_roles: false
```

The reset removes bot panel messages, temp voice records, ticket/template/log named bot structures, clears this guild entry from `channel-panels.json`, `temp-voice.json`, and `server-memory.json`, then rebuilds the selected template, channel panels, self-assign roles, and role-based channel permissions.

Protected by default: Discord system channel, Community rules channel, the command channel, manual channels that do not match bot rules, admin backend when `keep_admin=true`, and `server-logs` / `ticket-logs` when `keep_logs=true`.

## Dashboard MVP

The web dashboard lives in `apps/web` and the Express API lives in `apps/api`.

Install dependencies:

```bash
npm install
```

Local development:

```bash
npm run dashboard:dev
npm run api:dev
```

Or start both in one terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Discord OAuth2 redirect URL:

```text
http://localhost:4000/auth/discord/callback
```

Supabase setup:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env`.

Dashboard environment variables:

```env
DASHBOARD_API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
DASHBOARD_WEB_URL=http://localhost:3000
SESSION_SECRET=change_this_dashboard_session_secret
DISCORD_CLIENT_SECRET=your_discord_oauth_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:4000/auth/discord/callback
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

Railway deploy uses:

```bash
npm run dashboard:start
```

## 身分組與頻道權限連動

先預覽要套用的規則：

```text
/apply-role-permissions mode: preview
```

確認沒問題後產生二次確認按鈕：

```text
/apply-role-permissions mode: execute
```

按下確認後，Bot 會優先設定分類權限，並同步子頻道權限。`@everyone` 只保留社群入口與客服支援等公開區域；遊戲、投資、開發、設計、生活分類會依照使用者領取的身分組開放。`ticket-` 開頭頻道、臨時語音頻道與管理員後台會被保護，不會被當成一般分類處理。

執行前請確認：

- Bot 擁有 `Manage Channels`。
- Bot 角色順位高於要管理的身分組。
- 已先執行 `/setup-roles` 建立自助領取身分組。

Discord.js v14 的伺服器架構建立 Bot。支援 slash commands，可依模板自動建立分類、文字頻道、管理員後台、規則/公告/驗證頻道、基本角色與權限。

## 功能

- `/setup-server`：依模板建立伺服器架構
  - 接案工作室
  - 遊戲社群
  - 股票社群
  - 私人團隊
- `/announce`：管理員發送 Embed 公告
- `/lock`：鎖定目前頻道
- `/unlock`：解鎖目前頻道

## 安全設計

- 不刪除既有頻道
- 不清空伺服器
- 不使用 `eval`
- Bot 邀請不需要預設 `Administrator`
- 指令使用 `setDefaultMemberPermissions`
- 管理功能限制為具備 `ManageGuild` 或 `ManageChannels` 權限者

## 安裝

```bash
npm install
```

複製環境變數範例：

```bash
copy .env.example .env
```

在 `.env` 填入：

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_test_guild_id_here
OPENAI_API_KEY=
```

`GUILD_ID` 可用於測試伺服器部署，更新速度較快。若不填，會部署全域 slash commands。
`OPENAI_API_KEY` 為選填；若有設定，`/auto-organize` 會針對低信心或不確定頻道額外顯示 AI 整理建議。AI 只提供建議，不會自動搬移、刪除或改名頻道。

## Discord Developer Portal 設定

1. 到 Discord Developer Portal 建立 Application。
2. 建立 Bot 並取得 `DISCORD_TOKEN`。
3. 到 OAuth2 頁面取得 `CLIENT_ID`。
4. 邀請 Bot 時建議 scopes：
   - `bot`
   - `applications.commands`
5. Bot permissions 建議：
   - Manage Roles
   - Manage Channels
   - View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - Manage Messages

不需要給 `Administrator`。請確認 Bot 的角色位置高於它要建立或管理的角色。

## 部署 Slash Commands

```bash
npm run deploy
```

## 啟動 Bot

```bash
npm start
```

啟動成功後會看到：

```text
Discord Server Architect Bot 已登入：your-bot-tag
```

## 使用方式

在 Discord 伺服器輸入：

```text
/setup-server template: 接案工作室
```

或選擇其他模板。Bot 會建立或沿用同名角色、分類與頻道，不會刪除既有內容。

公告：

```text
/announce title: 重要公告 message: 今天晚上 9 點開會
```

鎖定目前頻道：

```text
/lock
```

解鎖目前頻道：

```text
/unlock
```

自動整理頻道：

```text
/auto-organize
```

`/auto-organize` 會先顯示搬家預覽。確認按鈕只會執行規則評分系統判定為中/高信心的搬移清單；AI 建議只會顯示在 Embed 中，不會被自動執行。

伺服器記憶學習：

```text
/learn-channel keyword: 美食 category: 🍜｜生活分享 weight: 5
```

查看已學習規則：

```text
/memory-list
```

刪除學習規則：

```text
/forget-channel-rule keyword: 美食
```

記憶資料會儲存在 `src/data/server-memory.json`，並以 Discord `guildId` 分開保存。Bot 不會自動學習，只有 `/learn-channel` 會寫入記憶；`/auto-organize` 只會讀取記憶規則來加分與顯示原因。

深度整理：

```text
/deep-cleanup mode: preview delete_level: safe use_ai: false
```

`preview` 只顯示計畫；`execute` 會先顯示同樣的預覽，必須再按「確認執行深度整理」才會建立分類、搬移、封存或依 `delete_level` 執行刪除。刪除前會先改名為 `delete-pending-原頻道名`，等待 5 秒後才刪除；每次最多搬移 30 個頻道、最多刪除 5 個頻道。

遊戲分區：

```text
/setup-game game: APEX short_name: apex create_default_channels: true
```

會建立 `🎮｜遊戲名稱` 分類、預設文字頻道與 `➕｜建立XXX語音` 語音入口。使用者可以用：

```text
/create-party game: APEX name: RK上分 limit: 3
```

建立臨時組隊語音。若使用者目前在語音中，Bot 會嘗試把使用者移進新頻道。玩家也可以直接加入 `➕｜建立XXX語音`，Bot 會自動建立 `🔊｜XXX-使用者名稱` 並移動使用者。臨時語音資料儲存在 `src/data/temp-voice.json`，沒人後 30 秒會自動刪除；非 Bot 記錄的語音頻道不會被刪除。

頻道面板：

```text
/setup-channel-panels mode: create target: all
```

`create` 只建立尚未記錄的面板，`refresh` 更新已記錄面板，`force` 只會刪除 Bot 自己發過且記錄在 `src/data/channel-panels.json` 的舊面板後重發。`target` 可選 `all`、`current`、`game`、`support`、`info`。面板按鈕會使用 `panel_` 前綴，Ticket 與臨時語音按鈕會串接現有 Ticket / tempVoice 系統。

公告自動置頂：

```text
/announcement-pin-settings max_pins: 3 enabled: true
```

啟用後，成員或管理員在名稱包含 `公告`、`announcement`、`活動公告` 的頻道發送新訊息時，Bot 會自動置頂並保留最新指定數量的公告置頂。Bot 自己發送的面板訊息不會被置頂。

身分組系統：

```text
/setup-roles
```

會建立自助身分組並在 `身分組領取` 或 `身分組` 頻道發送 Select Menu 面板。使用者可多選身分組；已選會加入，未選會移除。Bot 的角色順位必須高於要管理的身分組。

## Web Dashboard MVP

Dashboard 採用 Next.js App Router + Tailwind CSS + Express API + Discord OAuth2 + SQLite。

環境變數：

```env
DASHBOARD_API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
DASHBOARD_WEB_URL=http://localhost:3000
SESSION_SECRET=change_this_dashboard_session_secret
DISCORD_CLIENT_SECRET=your_discord_oauth_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:4000/auth/discord/callback
```

本機啟動：

```bash
npm run dashboard:dev
```

開啟：

```text
http://localhost:3000
```

Discord OAuth2 Redirect URL 請在 Discord Developer Portal 設定：

```text
http://localhost:4000/auth/discord/callback
```

Railway 部署時設定同樣環境變數，並把 `DASHBOARD_WEB_URL`、`DASHBOARD_API_URL`、`DISCORD_REDIRECT_URI` 改成 Railway 網址。專案已提供 `railway.json` 與 `Procfile`，預設啟動：

```bash
npm run dashboard:start
```

一鍵大洗牌：

```text
/rebuild-server template: mixed_community mode: preview old_channels: archive keep_admin: true
```

`preview` 絕不執行變更。`execute` 會顯示相同預覽，必須再按 `✅ 確認大洗牌` 才會建立新版分類與頻道、處理舊頻道、建立 `server-logs` 並發送整理紀錄。`old_channels: delete` 最多刪除 10 個舊頻道，且不會刪除執行指令所在頻道、`ticket-` 頻道、臨時語音或受保護管理頻道。

空分類清理：

```text
/cleanup-empty-categories mode: preview
```

`preview` 只顯示掃描結果；`execute` 會顯示確認按鈕，按下後才處理。預設只處理舊分類名稱，例如 `文字頻道`、`語音頻道`、`Uncategorized`、`舊分類`、`old-category`、`empty-category`、舊的 `📌｜資訊中心`、`💬｜玩家大廳`、`🎮｜遊戲專區`。safe 模式會改名成 `📦｜待刪除分類-原名稱`，不會直接刪除。
## AI 伺服器重整

```text
/ai-reorganize-server mode: preview use_ai: false old_channels: archive public_chat: true
```

`preview` 只會產生整理計畫，不會修改伺服器。確認內容沒問題後再執行：

```text
/ai-reorganize-server mode: execute use_ai: false old_channels: archive public_chat: true
```

execute 會先顯示確認按鈕，只有原本執行指令的人能按下「確認 AI 重整」。新的社群邏輯會讓 `📌｜社群入口`、`💬｜公開大廳`、`🎫｜客服支援` 對所有人可見，其中 `💬｜一般聊天` 會允許 @everyone 發言；遊戲分類、投資討論、創作與開發會用身分組解鎖；`🔒｜管理員後台` 和 `📦｜舊頻道封存` 會對 @everyone 隱藏。

如果要啟用 AI 建議，請在 `.env` 設定：

```env
OPENAI_API_KEY=your_openai_api_key
```

AI 建議只會出現在 preview 裡，不會直接刪除或搬移頻道。`old_channels: delete` 最多刪除 30 個舊頻道，且會避開正在執行指令的頻道、ticket- 頻道、臨時語音、Discord 系統頻道與建立語音觸發頻道。
## Temp Voice 2.0

加入 `➕｜建立XXX語音` 後，Bot 會建立 `🔊｜XXX-使用者名稱` 臨時語音房，並在 `src/data/temp-voice.json` 記錄房主、遊戲、建立時間、鎖房狀態、人數限制與控制台訊息。

設定：

```text
/tempvoice-settings auto_transfer:true auto_delete_seconds:30 create_control_panel:true create_activity_message:true
```

控制台不會發到公開聊天。使用 `/create-party` 建立時會用 ephemeral 回覆控制台；加入 `➕｜建立XXX語音` 建立時會優先 DM 房主，DM 失敗才 fallback 到 `🔒｜語音控制台`。公開頻道只會出現短通知，並於 10 分鐘後自動刪除。

重新取得控制台：

```text
/tempvoice-panel
```

管理員可指定語音房：

```text
/tempvoice-panel voice_channel: 🔊｜APEX-username
```

控制台按鈕：
- `🔒 鎖房`：禁止 @everyone 連入，但保留目前房內成員
- `🌐 公開`：恢復 @everyone Connect
- `👥 人數限制`：2 / 3 / 5 / 8 / 無限制
- `✏️ 改名`：使用 Modal，會過濾 `@everyone`、`@here`、`discord.gg`
- `👑 移交房主`：從目前房內成員選擇新房主
- `❌ 解散房間`：確認後踢出成員、刪除語音房、清除紀錄

只有房主與具備 `ManageChannels` 的管理員可以操作控制台。Bot 需要 `ManageChannels`、`MoveMembers`、`Connect`、`SendMessages`、`EmbedLinks` 權限。
