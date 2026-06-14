# Slash Commands

主要入口：`/community` `/game` `/voice` `/security` `/panel` `/admin` `/dev`

舊指令仍作為 alias 保留，並透過統一 command router 呼叫 legacy handler。

部署程式會自動掃描 `src/commands/*.js`，因此有效 command file 都會加入 deploy。

## Community

`/analyze-server` `/auto-organize` `/bootstrap-community` `/check-guest-visibility`
`/check-role-visibility` `/debug-permissions`
`/check-onboarding-visibility` `/community-about` `/community-architect`
`/community-roadmap` `/dedupe-layout` `/deep-cleanup` `/factory-reset-server`
`/layout-doctor` `/plan-cleanup` `/polish-server-design` `/rebuild-community-layout`
`/rebuild-community-v3` `/rebuild-server` `/repair-channel-permissions`
`/restore-active-channels`

## Channels And Panels

`/announce` `/announcement-pin-settings` `/cleanup-empty-categories` `/lock` `/move-channel`
`/refresh-community-guide` `/rename-channel` `/setup-channel-panels`
`/setup-community-guide` `/setup-server` `/setup-ticket` `/unlock`

## Games And Voice

`/archive-inactive-games` `/create-party` `/fix-game-category`
`/game-registry-doctor` `/setup-game` `/setup-voicehub` `/suggest-game`
`/tempvoice-doctor` `/tempvoice-panel` `/tempvoice-settings`
`/voice-leaderboard` `/voice-profile` `/voice-room-info` `/voice-status`

## Roles And Members

`/apply-role-permissions` `/cleanup-guest-roles` `/forget-channel-rule`
`/learn-channel` `/memory-list` `/role-settings` `/setup-roles`
`/welcome-settings`

## Security

`/automod-settings` `/linkguard-settings` `/linkguard-whitelist`
`/memberguard-release` `/memberguard-settings` `/memberguard-status`

## AI And Developer

`/ai-layout-repair` `/ai-reorganize-server` `/dev-audit-commands`
`/help-me-start`
