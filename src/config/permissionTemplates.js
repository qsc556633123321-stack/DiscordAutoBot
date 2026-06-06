const { PermissionFlagsBits } = require('discord.js');
const {
  ADMIN_ROLE_NAMES,
  FORMAL_ROLE_NAMES,
  GUEST_ROLE_NAMES,
  VISIBILITY_TYPES,
  buildVisibilityOverwrites
} = require('./channelVisibilityRules');

const ROLE_NAMES = {
  game: '🎮 遊戲玩家',
  nightCrew: '🌙 Night Crew',
  dev: '🛠 開發/AI',
  invest: '📈 股票投資',
  verified: '✅ 已驗證成員',
  guest: '👤 訪客',
  admin: ADMIN_ROLE_NAMES
};

function publicEntry(guild) {
  return buildVisibilityOverwrites(guild, { visibilityType: VISIBILITY_TYPES.publicEntry });
}

function onboardingVisible(guild) {
  return publicEntry(guild);
}

function formalMemberVisible(guild) {
  return buildVisibilityOverwrites(guild, { visibilityType: VISIBILITY_TYPES.formalMemberVisible });
}

function semiPublic(guild) {
  return buildVisibilityOverwrites(guild, {
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.game
  });
}

function roleRestricted(guild, roleName) {
  return buildVisibilityOverwrites(guild, { visibilityType: VISIBILITY_TYPES.roleRestricted, roleName });
}

function nightCrew(guild) {
  return buildVisibilityOverwrites(guild, {
    visibilityType: VISIBILITY_TYPES.hiddenSpecial,
    roleName: ROLE_NAMES.nightCrew,
    specialRoleName: ROLE_NAMES.nightCrew
  });
}

function adminOnly(guild) {
  return buildVisibilityOverwrites(guild, { visibilityType: VISIBILITY_TYPES.privateAdmin });
}

module.exports = {
  ADMIN_ROLE_NAMES,
  FORMAL_ROLE_NAMES,
  GUEST_ROLE_NAMES,
  PermissionFlagsBits,
  ROLE_NAMES,
  adminOnly,
  formalMemberVisible,
  nightCrew,
  onboardingVisible,
  publicEntry,
  roleRestricted,
  semiPublic
};
