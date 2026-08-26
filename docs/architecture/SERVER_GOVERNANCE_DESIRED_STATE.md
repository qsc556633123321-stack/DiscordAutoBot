# Server Governance Desired State

The authoritative `buildFullGuildDesiredState()` builder models the whole intended server: a small entry surface, community, shared game center, registry-derived specific game categories, interests, events, support, and isolated admin/internal resources. Runtime voice rooms and ticket instances are intentionally excluded from persistent desired resources.

Example projection:

```text
📌｜社群入口
  👋｜新人報到
  📜｜社群規則
💬｜社群大廳
  💭｜一般聊天
🎮｜遊戲中心
  🎮｜遊戲大廳
🎮｜VALORANT
  💬｜聊天
  🧑‍🤝‍🧑｜找隊友
  📌｜資訊
  🔊｜➕｜建立語音
🔒｜管理員後台
  server-logs
```

Specific game categories require `game:<gameId>`; the parent `game` role is limited to the shared game center.
