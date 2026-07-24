# Community Help Me Start Baseline

## Active runtime before migration

```text
command/alias registry
  -> src/legacy/commands/help-me-start.js
  -> src/systems/interactiveGuideSystem.js
  -> buildHelpMeStartEmbed
  -> buildBaseRecommendation + guild.channels.cache
  -> communityConcierge.generateConciergeText
  -> Discord EmbedBuilder
  -> deferReply({ ephemeral: true })
  -> editReply({ embeds: [embed] })
```

## Preserved command contract

| Item | Baseline |
| --- | --- |
| Command | `help-me-start` |
| Description | `用幾個問題快速推薦你該去哪裡開始` |
| `game` | optional string, max length `80`; `你通常玩什麼？例如 TFT、LOL、APEX、Minecraft` |
| `style` | optional: `rank`, `chat`, `night`, `tech` with original labels and order |
| `online_time` | optional: `day`, `evening`, `late`, `mixed` with original labels and order |
| Defaults | `game=''`, `style='chat'`, `onlineTime='mixed'` |
| Initial response | `await interaction.deferReply({ ephemeral: true })` |
| Completion response | `await interaction.editReply({ embeds: [embed] })` |
| Embed color/title | `0x5865f2` / `🧭 你的快速開始路線` |
| Description | `generateConciergeText('help_me_start', { guildName, answers, recommendation }, fallback)` |
| Fields | `推薦頻道`, `建議身分組`, `開始方式`; order and all `inline=false` preserved |
| Footer | `這只是起點，你可以慢慢調整自己的社群路線。` |
| Timestamp | runtime Embed timestamp; ownership moved to Presentation only |

## Recommendation contract

- Channel source is guild cache iteration order. It filters text-based channels, never fetches, sorts, creates, or edits them.
- Recommendation uses `Set`, preserving first matching mention order; maximum matches per individual pattern lookup remains eight.
- Role strings, tips, channel fallback patterns, and empty field fallbacks are unchanged.
- Game behavior deliberately retains `new RegExp(game, 'i')` with no escaping. An input such as `[` throws `SyntaxError`; this is a documented legacy risk, not fixed in this migration.
- AI fallback: `我會建議你先領對身分組，再去目前語音房或找隊友大廳看看。`
- Existing Concierge behavior returns fallback when AI is unavailable, throws internally, or yields no usable content. Reader errors and generator errors outside that adapter propagate as before.

## Fixture coverage

`tests/fixtures/helpMeStartFakes.js` and focused tests cover default answers, game, rank/chat/night/tech styles, late/evening time, no matching channel, duplicate mention removal, original order, maximum eight, AI success, AI fallback, and malformed special-RegExp behavior. Fixtures never call OpenAI.
