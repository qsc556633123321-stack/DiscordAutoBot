const { ChannelType } = require('discord.js');
const { isSameGame, stripGameCategoryPrefix } = require('./gameIdentityService');
const { readGameCategoryMetadata } = require('./gameChannels');

const INTEREST_KEYWORDS = ['音樂分享', '美食分享', '迷因與好圖', '攝影分享', '影劇動漫'];
const ONBOARDING_KEYWORDS = ['新人報到', '社群規則', '公告', '伺服器導覽', '身分組領取'];
const ACTIVITY_KEYWORDS = ['目前語音房', '找隊友大廳', '遊戲提議', '一般聊天', '深夜聊天', '組隊招募'];

function hasName(guild, keyword) {
  return guild.channels.cache.some((channel) => channel.name.includes(keyword));
}

function findDuplicateGameGroups(guild) {
  const groups = [];
  const buckets = [];
  const gameCategories = guild.channels.cache.filter((channel) => (
    channel.type === ChannelType.GuildCategory &&
    (channel.name.startsWith('🎮｜') || channel.name.startsWith('duplicate-game-🎮｜')) &&
    !/遊戲中心|遊戲大廳/.test(channel.name)
  ));

  for (const category of gameCategories.values()) {
    const displayName = stripGameCategoryPrefix(category.name.replace(/^duplicate-game-/i, ''));
    const bucket = buckets.find((item) => isSameGame(item.displayName, displayName));
    if (bucket) bucket.categories.push(category);
    else buckets.push({ displayName, categories: [category] });
  }

  for (const bucket of buckets) {
    if (bucket.categories.length > 1) groups.push(bucket.categories);
  }
  return groups;
}

function findBadGameChildNames(guild) {
  const bad = [];
  const gameMetadata = readGameCategoryMetadata()[guild.id] || {};
  const gameCategoryIds = new Set(Object.keys(gameMetadata));
  for (const category of guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildCategory && (channel.name.startsWith('🎮｜') || channel.name.startsWith('duplicate-game-🎮｜'))).values()) {
    if (/遊戲中心|遊戲大廳/.test(category.name)) continue;
    gameCategoryIds.add(category.id);
  }

  for (const categoryId of gameCategoryIds) {
    const category = guild.channels.cache.get(categoryId);
    if (!category) continue;
    for (const channel of guild.channels.cache.filter((item) => item.parentId === category.id).values()) {
      const expected = expectedGameChildName(channel);
      if (expected && channel.name !== expected) bad.push({ channel, expected, category });
    }
  }
  return bad;
}

function expectedGameChildName(channel) {
  if (/聊天/.test(channel.name)) return '💬｜聊天';
  if (/找隊友|lfg/i.test(channel.name)) return '🧑‍🤝‍🧑｜找隊友';
  if (/資訊|info/i.test(channel.name)) return '📌｜資訊';
  if (channel.type === ChannelType.GuildVoice && /建立.*語音/u.test(channel.name)) return '🔊｜➕｜建立語音';
  return null;
}

function findScatteredInterests(guild) {
  const interestCategory = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === '🎨｜興趣交流');
  return guild.channels.cache.filter((channel) => (
    channel.type !== ChannelType.GuildCategory &&
    INTEREST_KEYWORDS.some((keyword) => channel.name.includes(keyword)) &&
    (!interestCategory || channel.parentId !== interestCategory.id)
  ));
}

function findPermissionIssues(guild) {
  const issues = [];
  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory || !channel.parent) continue;
    const parentKeys = [...channel.parent.permissionOverwrites.cache.keys()].sort().join(',');
    const childKeys = [...channel.permissionOverwrites.cache.keys()].sort().join(',');
    if (parentKeys !== childKeys) issues.push(channel);
  }
  return issues;
}

function scoreCommunityHealth(guild) {
  const duplicateGames = findDuplicateGameGroups(guild);
  const badGameChildNames = findBadGameChildNames(guild);
  const scatteredInterests = findScatteredInterests(guild);
  const permissionIssues = findPermissionIssues(guild);

  const channelClarity = Math.max(0, 20 - duplicateGames.length * 5 - scatteredInterests.size * 2);
  const gameHealth = Math.max(0, 20 - duplicateGames.length * 6 - badGameChildNames.length * 3);
  const onboardingFound = ONBOARDING_KEYWORDS.filter((keyword) => hasName(guild, keyword)).length;
  const onboardingScore = Math.min(20, onboardingFound * 4);
  const permissionSafety = Math.max(0, 20 - permissionIssues.length * 2);
  const activityFound = ACTIVITY_KEYWORDS.filter((keyword) => hasName(guild, keyword)).length;
  const activityScore = Math.min(20, activityFound * 4);

  const total = channelClarity + gameHealth + onboardingScore + permissionSafety + activityScore;
  return {
    total,
    sections: {
      channelClarity,
      gameHealth,
      onboardingScore,
      permissionSafety,
      activityScore
    },
    findings: {
      duplicateGames,
      badGameChildNames,
      scatteredInterests: [...scatteredInterests.values()],
      permissionIssues
    }
  };
}

module.exports = {
  expectedGameChildName,
  findBadGameChildNames,
  findDuplicateGameGroups,
  findPermissionIssues,
  findScatteredInterests,
  scoreCommunityHealth
};
