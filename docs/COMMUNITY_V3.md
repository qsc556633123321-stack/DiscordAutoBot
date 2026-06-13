# Community Architecture V3

V3 是科幻基地唯一社群結構來源，定義於：

`src/domain/community/communityArchitectureV3.js`

Legacy 設定目前由該 domain source 包裝，Phase 2 將逐步讓舊 systems 直接依賴 domain。

## Principles

- 新人只看社群入口與客服支援。
- 正式成員解鎖社群大廳、遊戲中心、興趣交流與活動。
- 遊戲玩家解鎖實際遊戲分類。
- 知識、Night Crew、管理員後台依角色限制。
- 非 V3 舊頻道只封存，不直接刪除。
- Discord 不支援 category nesting；熱門與玩家遊戲分類使用排序形成視覺層級。

```text
/rebuild-community-v3 mode:preview
/rebuild-community-v3 mode:execute
```
