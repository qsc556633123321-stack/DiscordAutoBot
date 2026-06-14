const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { CATEGORIES, GAMES, GAME_CHANNELS, V3_VERSION } = require('../config/communityArchitectureV3');
const { isSameGame, stripGameCategoryPrefix } = require('../domain/games/gameIdentityService');

function everyoneCanView(channel) {
  return Boolean(channel.permissionsFor(channel.guild.roles.everyone)?.has(PermissionFlagsBits.ViewChannel));
}

function validateCommunityV3(guild) {
  const issues = [];
  const categories = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildCategory);
  for (const config of CATEGORIES) {
    const category = categories.find((item) => item.name === config.name);
    if (!category) {
      issues.push(`缺少分類：${config.name}`);
      continue;
    }
    const shouldPublic = config.permission === 'public_entry';
    if (everyoneCanView(category) !== shouldPublic) {
      issues.push(`分類權限錯誤：${category.name}`);
    }
    for (const spec of config.channels) {
      const channel = guild.channels.cache.find((item) => item.parentId === category.id && item.name === spec.name);
      if (!channel) issues.push(`缺少頻道：${config.name} / ${spec.name}`);
    }
  }

  for (const game of GAMES) {
    const matches = categories.filter((category) => isSameGame(stripGameCategoryPrefix(category.name), game.displayName));
    if (matches.size === 0) issues.push(`缺少遊戲分類：${game.displayName}`);
    if (matches.size > 1) issues.push(`重複遊戲分類：${game.displayName} (${matches.size})`);
    const category = matches.first();
    if (category && everyoneCanView(category)) issues.push(`遊戲分類外漏：${category.name}`);
    if (category) {
      for (const spec of GAME_CHANNELS) {
        if (!guild.channels.cache.some((channel) => channel.parentId === category.id && channel.name === spec.name)) {
          issues.push(`遊戲子頻道缺少：${category.name} / ${spec.name}`);
        }
      }
    }
  }
  return { version: V3_VERSION, ok: issues.length === 0, issues };
}

module.exports = { validateCommunityV3 };
