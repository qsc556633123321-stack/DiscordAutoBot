# Permissions

Guest Gate 規則由 Community V3 domain 與 `communityPermissionService` 統一協調。

- `@everyone` 與訪客：社群入口、客服支援。
- 正式成員：社群大廳、遊戲中心、興趣交流、活動專區。
- 遊戲玩家：實際遊戲分類。
- 開發/AI、股票投資、Night Crew：對應限制區。
- 站長、管理員、MOD、Bot：管理員後台。

```text
/repair-channel-permissions mode:preview scope:guest_gate
/repair-channel-permissions mode:execute scope:guest_gate
/check-guest-visibility
```

Discord 原生 Onboarding 只使用入口頻道，不使用遊戲中心、目前語音房或社群大廳。
