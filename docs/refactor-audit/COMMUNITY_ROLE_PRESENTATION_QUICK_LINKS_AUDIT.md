# Community Role Presentation Quick Links Audit

`quickLinks` stays in `src/systems/communityConcierge.js` for this migration.

| Kind | Existing channel-name patterns |
| --- | --- |
| `games` | 找隊友, 組隊, 目前語音, 遊戲提議, 聊天 |
| `invest` | 台股, 盤勢, 股票, 投資 |
| `dev` | 程式, AI, 開發, 作品 |

The helper filters the current guild text-channel cache, formats mentions, and
limits results to eight. These are runtime Discord-resource decisions, not
static payload construction. The candidate consumes only the resulting array;
the next implementation must preserve call timing, patterns, order, fallback,
and `links.join('\n')` behavior.
