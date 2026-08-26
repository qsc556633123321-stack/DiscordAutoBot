const GAME_REGISTRY = require('../games/gameRegistry');
const { getGameRoleKey } = require('../games/gameAccessPolicy');
const { getGameLayoutProfile } = require('../games/gameLayoutProfiles');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose, PermissionProfile, createGovernedResource } = require('./channelGovernance');

const CHANNEL_NAMES = Object.freeze({
  welcome: '👋｜新人報到', rules: '📜｜社群規則', announcements: '📢｜公告', guide: '🧭｜伺服器導覽', roles: '✅｜身分組領取', general: '💭｜一般聊天', community_chat: '💬｜社群交流', community_lfg: '🤝｜找人一起玩', community_info: '📌｜社群資訊', game_lobby: '🎮｜遊戲大廳', game_lfg: '📢｜組隊招募', game_suggestions: '📋｜遊戲提議', game_database: '🗃｜遊戲資料庫', chat: '💬｜聊天', lfg: '🧑‍🤝‍🧑｜找隊友', info: '📌｜資訊', voice_entry: '🔊｜➕｜建立語音', chat_lfg: '💬｜聊天與找隊友', dev: '💻｜程式開發', invest: '📈｜股票投資', creator: '🎨｜創作分享', night: '🌙｜深夜交流', giveaway: '🎁｜抽獎活動', polls: '🗳｜投票區', events: '📅｜活動公告', ticket_open: '🎫｜開啟客服單', ticket_help: '💡｜客服說明', admin_logs: 'server-logs', bot_logs: 'bot-logs', moderation: 'mod-tools', bot_control: 'bot-control'
});

function category(key, displayName, purpose, accessProfile, legacyNames = []) { return createGovernedResource({ key: `category:${key}`, displayName, type: 'category', purpose, owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile, lifecycle: ChannelLifecycle.PERSISTENT, importance: 'high', deletePolicy: 'managed_only', legacyNames }); }
function channel(key, displayName, parentKey, purpose, accessProfile, accessRoleKey = null, type = 'text', legacyNames = []) { return createGovernedResource({ key: `channel:${key}`, displayName, type, purpose, owner: ChannelOwnership.MANAGED_CANONICAL, parentKey, accessProfile, accessRoleKey, lifecycle: ChannelLifecycle.PERSISTENT, importance: 'normal', deletePolicy: 'managed_only', legacyNames }); }

function staticResources() {
  const entry = category('entry', '📌｜社群入口', ChannelPurpose.ENTRY, PermissionProfile.PUBLIC_ENTRY, ['社群入口']);
  const community = category('community', '💬｜社群大廳', ChannelPurpose.COMMUNITY_CHAT, PermissionProfile.MEMBER_DISCUSSION, ['公開大廳', '社群大廳']);
  const gameCenter = category('game_center', '🎮｜遊戲中心', ChannelPurpose.GAME_CENTER, PermissionProfile.GAME_CENTER, ['遊戲大廳']);
  const interests = category('interests', '🎨｜興趣交流', ChannelPurpose.INTEREST, PermissionProfile.MEMBER_DISCUSSION);
  const events = category('events', '🎉｜活動專區', ChannelPurpose.EVENT, PermissionProfile.MEMBER_DISCUSSION);
  const support = category('support', '🎫｜客服支援', ChannelPurpose.TICKET, PermissionProfile.PUBLIC_ENTRY, ['客服支援']);
  const admin = category('admin', '🔒｜管理員後台', ChannelPurpose.ADMIN, PermissionProfile.ADMIN, ['管理員後台']);
  const resources = [entry, community, gameCenter, interests, events, support, admin];
  const add = (key, name, parent, purpose, profile, role, type, aliases) => resources.push(channel(key, name, parent.key, purpose, profile, role, type, aliases));
  add('welcome', CHANNEL_NAMES.welcome, entry, ChannelPurpose.WELCOME, PermissionProfile.PUBLIC_ENTRY); add('rules', CHANNEL_NAMES.rules, entry, ChannelPurpose.RULES, PermissionProfile.PUBLIC_READONLY); add('announcements', CHANNEL_NAMES.announcements, entry, ChannelPurpose.ANNOUNCEMENT, PermissionProfile.PUBLIC_READONLY); add('guide', CHANNEL_NAMES.guide, entry, ChannelPurpose.ENTRY, PermissionProfile.PUBLIC_READONLY); add('roles', CHANNEL_NAMES.roles, entry, ChannelPurpose.ENTRY, PermissionProfile.PUBLIC_ENTRY);
  add('general', CHANNEL_NAMES.general, community, ChannelPurpose.GENERAL_CHAT, PermissionProfile.MEMBER_DISCUSSION); add('community_chat', CHANNEL_NAMES.community_chat, community, ChannelPurpose.COMMUNITY_CHAT, PermissionProfile.MEMBER_DISCUSSION); add('community_lfg', CHANNEL_NAMES.community_lfg, community, ChannelPurpose.COMMUNITY_CHAT, PermissionProfile.MEMBER_DISCUSSION); add('community_info', CHANNEL_NAMES.community_info, community, ChannelPurpose.COMMUNITY_CHAT, PermissionProfile.READONLY_INFO);
  add('game_lobby', CHANNEL_NAMES.game_lobby, gameCenter, ChannelPurpose.GAME_CENTER, PermissionProfile.GAME_CENTER); add('game_lfg', CHANNEL_NAMES.game_lfg, gameCenter, ChannelPurpose.GAME_LFG, PermissionProfile.GAME_CENTER); add('game_suggestions', CHANNEL_NAMES.game_suggestions, gameCenter, ChannelPurpose.GAME_CENTER, PermissionProfile.GAME_CENTER); add('game_database', CHANNEL_NAMES.game_database, gameCenter, ChannelPurpose.GAME_INFO, PermissionProfile.READONLY_INFO);
  add('dev', CHANNEL_NAMES.dev, interests, ChannelPurpose.INTEREST, PermissionProfile.MEMBER_DISCUSSION, 'dev'); add('invest', CHANNEL_NAMES.invest, interests, ChannelPurpose.INTEREST, PermissionProfile.MEMBER_DISCUSSION, 'invest'); add('creator', CHANNEL_NAMES.creator, interests, ChannelPurpose.INTEREST, PermissionProfile.MEMBER_DISCUSSION, 'creator'); add('night', CHANNEL_NAMES.night, interests, ChannelPurpose.INTEREST, PermissionProfile.MEMBER_DISCUSSION, 'night');
  add('giveaway', CHANNEL_NAMES.giveaway, events, ChannelPurpose.EVENT, PermissionProfile.MEMBER_DISCUSSION); add('polls', CHANNEL_NAMES.polls, events, ChannelPurpose.EVENT, PermissionProfile.MEMBER_DISCUSSION); add('events', CHANNEL_NAMES.events, events, ChannelPurpose.EVENT, PermissionProfile.READONLY_INFO);
  add('ticket_open', CHANNEL_NAMES.ticket_open, support, ChannelPurpose.TICKET, PermissionProfile.PUBLIC_ENTRY); add('ticket_help', CHANNEL_NAMES.ticket_help, support, ChannelPurpose.TICKET, PermissionProfile.PUBLIC_READONLY);
  add('admin_logs', CHANNEL_NAMES.admin_logs, admin, ChannelPurpose.BOT_LOG, PermissionProfile.BOT_INTERNAL); add('bot_logs', CHANNEL_NAMES.bot_logs, admin, ChannelPurpose.BOT_LOG, PermissionProfile.BOT_INTERNAL); add('moderation', CHANNEL_NAMES.moderation, admin, ChannelPurpose.ADMIN, PermissionProfile.ADMIN); add('bot_control', CHANNEL_NAMES.bot_control, admin, ChannelPurpose.ADMIN, PermissionProfile.BOT_INTERNAL);
  return resources;
}

function gameResources(gameRegistry) {
  return gameRegistry.flatMap((game) => {
    const parent = createGovernedResource({ key: `category:game:${game.id}`, displayName: `🎮｜${game.displayName}`, type: 'category', purpose: ChannelPurpose.GAME_CENTER, owner: ChannelOwnership.MANAGED_CANONICAL, accessProfile: PermissionProfile.SPECIFIC_GAME, accessRoleKey: getGameRoleKey(game.id), lifecycle: ChannelLifecycle.PERSISTENT, importance: 'high', deletePolicy: 'managed_only', legacyNames: [game.displayName] });
    return [parent, ...getGameLayoutProfile(game.layoutProfile).map((spec) => channel(`game:${game.id}:${spec.key}`, CHANNEL_NAMES[spec.key], parent.key, spec.purpose, spec.key === 'info' ? PermissionProfile.READONLY_INFO : spec.type === 'voice' ? PermissionProfile.VOICE_ENTRY : PermissionProfile.SPECIFIC_GAME, getGameRoleKey(game.id), spec.type))];
  });
}

function buildFullGuildDesiredState({ gameRegistry = GAME_REGISTRY } = {}) { return Object.freeze({ resources: Object.freeze([...staticResources(), ...gameResources(gameRegistry)]) }); }
function buildServerGovernanceDesiredState(options) { return buildFullGuildDesiredState(options); }
module.exports = { CHANNEL_NAMES, buildFullGuildDesiredState, buildServerGovernanceDesiredState };
