# Community Role Concierge Payload Matrix

| Action | Color | Title | Description condition | Fields | Empty-link fallback |
| --- | --- | --- | --- | --- | --- |
| `games` | `0x5865f2` | `🎮 遊戲入口` | fixed introduction | current directions, recommended links, role status | `目前還沒有找到遊戲入口頻道。` |
| `invest` | `0x27ae60` | `📈 投資入口` | `added` changes join/unlock wording | recommended links | `目前還沒有找到相關入口。` |
| `dev` | `0x9b59b6` | `🧑‍💻 AI / 開發入口` | `added` changes join/unlock wording | recommended links | `目前還沒有找到相關入口。` |

All three payloads are `{ embeds, ephemeral: true }`. Link order, matching,
formatting, max-eight limit, and fallback selection remain runtime-owned by
`quickLinks(guild, kind)` and `listChannelsByPatterns`; a future presentation
builder receives the already-computed `links` array.

The frozen candidate is intentionally exact: it uses the existing text,
colors, field order, inline values, and conditional `added` wording without
introducing validation or normalization.
