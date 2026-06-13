const path = require('node:path');
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const {
  CATEGORIES,
  CATEGORY_ORDER,
  GAMES,
  GAME_CHANNELS,
  ONBOARDING,
  ROLES,
  V3_VERSION
} = require('../config/communityArchitectureV3');
const { buildV3Overwrites } = require('./communityV3PermissionBuilder');
const { isSameGame, resolveGameIdentity, stripGameCategoryPrefix } = require('./gameIdentityService');
const { registerCreateEntryChannel, upsertDynamicGameMetadata } = require('./gameChannels');
const { isTempVoice } = require('./tempVoice');
const { setupChannelPanels } = require('./channelPanels');
const { setupCommunityGuide } = require('./communityConcierge');
const { writeServerLog } = require('./serverLogs');
const { validateCommunityV3 } = require('./communityV3Validator');
const { readJson, updateJson } = require('../infrastructure/storage/jsonStore');

const PLAN_FILE = path.join(__dirname, '..', 'data', 'community-v3-plans.json');
const STEP_DELAY_MS = 800;

function sleep(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(name = '') {
  return String(name).normalize('NFKC').toLowerCase()
    .replace(/[\u{1f000}-\u{1faff}\u{2600}-\u{27bf}\ufe0f]/gu, '')
    .replace(/[\s｜|_\-]+/gu, '')
    .trim();
}

function readPlans() {
  return readJson(PLAN_FILE, {});
}

function saveV3Plan(plan) {
  updateJson(PLAN_FILE, (data) => {
    data[plan.planId] = plan;
    return data;
  }, {});
}

function getV3Plan(planId) {
  return readPlans()[planId] || null;
}

function deleteV3Plan(planId) {
  updateJson(PLAN_FILE, (data) => {
    delete data[planId];
    return data;
  }, {});
}

function namesFor(config) {
  return [config.name, ...(config.aliases || [])].map(normalize);
}

function findCategory(guild, config) {
  const names = new Set(namesFor(config));
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && names.has(normalize(channel.name))) || null;
}

function findChannel(guild, category, spec) {
  const exact = guild.channels.cache.find((channel) => channel.parentId === category?.id && channel.type === spec.type && normalize(channel.name) === normalize(spec.name));
  if (exact) return exact;
  return guild.channels.cache.find((channel) => channel.type === spec.type && normalize(channel.name) === normalize(spec.name)) || null;
}

function findGameCategory(guild, game) {
  const matches = guild.channels.cache.filter((channel) => (
    channel.type === ChannelType.GuildCategory &&
    isSameGame(stripGameCategoryPrefix(channel.name), game.displayName)
  ));
  return matches.find((channel) => channel.name === `🎮｜${game.displayName}`) || matches.first() || null;
}

function findGameCategories(guild, game) {
  return guild.channels.cache.filter((channel) => (
    channel.type === ChannelType.GuildCategory &&
    isSameGame(stripGameCategoryPrefix(channel.name), game.displayName)
  ));
}

function findGameChild(guild, category, spec) {
  const children = guild.channels.cache.filter((channel) => channel.parentId === category?.id && channel.type === spec.type);
  const exact = children.find((channel) => normalize(channel.name) === normalize(spec.name));
  if (exact) return exact;
  const patterns = {
    chat: /聊天/u,
    lfg: /找隊友/u,
    info: /資訊|info/i,
    voice_create: /建立.*語音|建立語音/u
  };
  return children.find((channel) => patterns[spec.key]?.test(channel.name)) || null;
}

function protectedChannel(guild, channel) {
  return channel.name.startsWith('ticket-') ||
    isTempVoice(guild.id, channel.id) ||
    [guild.systemChannelId, guild.rulesChannelId, guild.publicUpdatesChannelId].includes(channel.id);
}

function collectExpectedMatches(guild) {
  const managed = new Set();
  for (const categoryConfig of CATEGORIES) {
    const category = findCategory(guild, categoryConfig);
    if (category) managed.add(category.id);
    for (const spec of categoryConfig.channels) {
      const channel = findChannel(guild, category, spec);
      if (channel) managed.add(channel.id);
    }
  }
  for (const game of GAMES) {
    const category = findGameCategory(guild, game);
    if (!category) continue;
    managed.add(category.id);
    for (const spec of GAME_CHANNELS) {
      const channel = findGameChild(guild, category, spec);
      if (channel) managed.add(channel.id);
    }
  }
  return managed;
}

function buildCommunityV3Plan(guild, createdBy) {
  const actions = [];
  const managed = collectExpectedMatches(guild);

  for (const roleConfig of ROLES) {
    const aliases = new Set([roleConfig.name, ...(roleConfig.aliases || [])]);
    const role = guild.roles.cache.find((item) => aliases.has(item.name));
    if (!role) actions.push({ type: 'create_role', targetName: roleConfig.name });
    else if (role.name !== roleConfig.name) actions.push({ type: 'rename_role', targetId: role.id, targetName: role.name, newName: roleConfig.name });
  }

  for (const categoryConfig of CATEGORIES) {
    const category = findCategory(guild, categoryConfig);
    if (!category) actions.push({ type: 'create_category', key: categoryConfig.key, targetName: categoryConfig.name });
    else {
      if (category.name !== categoryConfig.name) actions.push({ type: 'rename', targetId: category.id, targetName: category.name, newName: categoryConfig.name });
      actions.push({ type: 'sync_permission', targetId: category.id, targetName: category.name, permission: categoryConfig.permission });
    }
    for (const spec of categoryConfig.channels) {
      const channel = findChannel(guild, category, spec);
      if (!channel) actions.push({ type: 'create_channel', categoryKey: categoryConfig.key, key: spec.key, targetName: spec.name });
      else {
        if (channel.name !== spec.name) actions.push({ type: 'rename', targetId: channel.id, targetName: channel.name, newName: spec.name });
        if (category && channel.parentId !== category.id) actions.push({ type: 'move', targetId: channel.id, targetName: channel.name, targetCategory: categoryConfig.name });
        actions.push({ type: 'sync_permission', targetId: channel.id, targetName: channel.name, permission: spec.permission });
      }
    }
  }

  for (const game of GAMES) {
    const category = findGameCategory(guild, game);
    if (!category) actions.push({ type: 'create_game', gameId: game.id, targetName: game.displayName, tier: game.tier });
    else {
      const canonicalName = `🎮｜${game.displayName}`;
      if (category.name !== canonicalName) actions.push({ type: 'rename', targetId: category.id, targetName: category.name, newName: canonicalName });
      actions.push({ type: 'repair_game', targetId: category.id, targetName: canonicalName, gameId: game.id, tier: game.tier });
      const duplicates = findGameCategories(guild, game).filter((item) => item.id !== category.id);
      for (const duplicate of duplicates.values()) {
        actions.push({
          type: 'archive_game_category',
          targetId: duplicate.id,
          targetName: duplicate.name,
          targetCategory: '📦｜遊戲封存區',
          reason: `與 ${canonicalName} 為相同遊戲`
        });
      }
    }
  }

  const archive = CATEGORIES.find((item) => item.key === 'old_archive');
  const gameArchive = CATEGORIES.find((item) => item.key === 'game_archive');
  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory || managed.has(channel.id) || protectedChannel(guild, channel)) continue;
    if (channel.parent && [archive.name, gameArchive.name].map(normalize).includes(normalize(channel.parent.name))) continue;
    actions.push({ type: 'archive', targetId: channel.id, targetName: channel.name, targetCategory: archive.name });
  }

  actions.push({ type: 'reorder', targetName: 'V3 主分類與遊戲分類' });
  actions.push({ type: 'refresh_panels', targetName: 'V3 導覽與頻道面板' });
  return {
    planId: `v3_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    version: V3_VERSION,
    guildId: guild.id,
    createdBy,
    createdAt: new Date().toISOString(),
    onboarding: ONBOARDING,
    actions
  };
}

async function retryOperation(task, attempts = 2) {
  try {
    return await task();
  } catch (error) {
    if (attempts <= 1 || !(error.status === 429 || /rate.?limit/i.test(error.message || ''))) throw error;
    await sleep(Math.max(Number(error.retryAfter || 1) * 1000, 1500));
    return retryOperation(task, attempts - 1);
  }
}

async function ensureRoles(guild, summary) {
  for (const config of ROLES) {
    const names = new Set([config.name, ...(config.aliases || [])]);
    let role = guild.roles.cache.find((item) => names.has(item.name));
    try {
      if (!role) {
        role = await retryOperation(() => guild.roles.create({
          name: config.name,
          color: config.color,
          hoist: Boolean(config.hoist),
          mentionable: false,
          permissions: [],
          reason: 'Community Architecture V3 role setup'
        }));
        summary.created.push(`role: ${role.name}`);
      } else if (!role.managed) {
        await retryOperation(() => role.edit({
          name: config.name,
          color: config.color,
          hoist: Boolean(config.hoist),
          mentionable: false,
          reason: 'Community Architecture V3 role repair'
        }));
        summary.updated.push(`role: ${role.name}`);
      }
    } catch (error) {
      summary.failed.push(`role ${config.name}: ${error.message}`);
    }
    await sleep();
  }
}

async function ensureCategory(guild, config, summary) {
  let category = findCategory(guild, config);
  try {
    if (!category) {
      category = await retryOperation(() => guild.channels.create({
        name: config.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: buildV3Overwrites(guild, config.permission),
        reason: 'Community Architecture V3 category setup'
      }));
      summary.created.push(category.name);
    } else {
      if (category.name !== config.name) await retryOperation(() => category.setName(config.name, 'Community Architecture V3 canonical name'));
      await retryOperation(() => category.permissionOverwrites.set(buildV3Overwrites(guild, config.permission), 'Community Architecture V3 category permission'));
      summary.updated.push(category.name);
    }
  } catch (error) {
    summary.failed.push(`${config.name}: ${error.message}`);
  }
  await sleep();
  return category;
}

async function ensureChannel(guild, category, spec, summary) {
  let channel = findChannel(guild, category, spec);
  try {
    if (!channel) {
      channel = await retryOperation(() => guild.channels.create({
        name: spec.name,
        type: spec.type,
        parent: category.id,
        permissionOverwrites: buildV3Overwrites(guild, spec.permission),
        reason: 'Community Architecture V3 channel setup'
      }));
      summary.created.push(`${category.name} / ${channel.name}`);
    } else {
      if (channel.name !== spec.name) await retryOperation(() => channel.setName(spec.name, 'Community Architecture V3 canonical name'));
      if (channel.parentId !== category.id) await retryOperation(() => channel.setParent(category.id, { lockPermissions: false, reason: 'Community Architecture V3 move' }));
      await retryOperation(() => channel.permissionOverwrites.set(buildV3Overwrites(guild, spec.permission), 'Community Architecture V3 channel permission'));
      summary.updated.push(channel.name);
    }
  } catch (error) {
    summary.failed.push(`${spec.name}: ${error.message}`);
  }
  await sleep();
  return channel;
}

async function ensureGame(guild, game, summary, createdBy) {
  const identity = resolveGameIdentity(game.displayName);
  const config = { ...game, displayName: identity.displayName || game.displayName };
  let category = findGameCategory(guild, config);
  const categoryName = `🎮｜${config.displayName}`;
  try {
    if (!category) {
      category = await retryOperation(() => guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: buildV3Overwrites(guild, 'game'),
        reason: 'Community Architecture V3 game category'
      }));
      summary.created.push(category.name);
    } else {
      if (category.name !== categoryName) await retryOperation(() => category.setName(categoryName, 'Community Architecture V3 game canonical name'));
      await retryOperation(() => category.permissionOverwrites.set(buildV3Overwrites(guild, 'game'), 'Community Architecture V3 game permission'));
      summary.updated.push(category.name);
    }

    const channelMap = {};
    for (let index = 0; index < GAME_CHANNELS.length; index += 1) {
      const spec = GAME_CHANNELS[index];
      let channel = findGameChild(guild, category, spec);
      if (!channel) {
        channel = await retryOperation(() => guild.channels.create({
          name: spec.name,
          type: spec.type,
          parent: category.id,
          userLimit: spec.userLimit,
          permissionOverwrites: buildV3Overwrites(guild, 'game'),
          reason: 'Community Architecture V3 game channel'
        }));
        summary.created.push(`${category.name} / ${channel.name}`);
      } else {
        if (channel.name !== spec.name) await retryOperation(() => channel.setName(spec.name, 'Community Architecture V3 game channel name'));
        if (channel.parentId !== category.id) await retryOperation(() => channel.setParent(category.id, { lockPermissions: false, reason: 'Community Architecture V3 game move' }));
        await retryOperation(() => channel.permissionOverwrites.set(buildV3Overwrites(guild, 'game'), 'Community Architecture V3 game channel permission'));
      }
      await channel.setPosition(index).catch(() => null);
      if (spec.key === 'voice_create') registerCreateEntryChannel(guild, channel, config.displayName);
      channelMap[spec.key === 'voice_create' ? 'voiceCreate' : spec.key] = channel;
      await sleep();
    }
    upsertDynamicGameMetadata(guild, category, {
      displayName: config.displayName,
      slug: identity.slug,
      gameId: identity.gameId || identity.id,
      tier: config.tier
    }, channelMap, createdBy);
  } catch (error) {
    summary.failed.push(`${categoryName}: ${error.message}`);
  }
  return category;
}

async function reorderV3(guild, categoryMap, gameMap, summary) {
  const order = [];
  for (const key of CATEGORY_ORDER) {
    const category = categoryMap.get(key);
    if (category) order.push(category);
    if (key === 'popular_games') {
      for (const game of GAMES.filter((item) => item.tier === 'popular')) if (gameMap.get(game.id)) order.push(gameMap.get(game.id));
    }
    if (key === 'player_games') {
      for (const game of GAMES.filter((item) => item.tier === 'player')) if (gameMap.get(game.id)) order.push(gameMap.get(game.id));
    }
  }
  for (let index = 0; index < order.length; index += 1) {
    await order[index].setPosition(index, { reason: 'Community Architecture V3 ordering' }).catch((error) => summary.failed.push(`${order[index].name} order: ${error.message}`));
    await sleep(300);
  }
}

async function executeCommunityV3(guild, plan, client) {
  const summary = { created: [], updated: [], moved: [], archived: [], skipped: [], failed: [] };
  await writeServerLog(guild, { title: '🏗️ Community Architecture V3 開始執行', description: `plan: ${plan.planId}`, color: 0x5865f2 }).catch(() => null);
  await ensureRoles(guild, summary);

  const categoryMap = new Map();
  for (const config of CATEGORIES) {
    const category = await ensureCategory(guild, config, summary);
    if (category) categoryMap.set(config.key, category);
    for (const spec of config.channels) if (category) await ensureChannel(guild, category, spec, summary);
  }

  const gameMap = new Map();
  for (const game of GAMES) {
    const category = await ensureGame(guild, game, summary, plan.createdBy);
    if (category) gameMap.set(game.id, category);
  }

  const gameArchive = categoryMap.get('game_archive');
  for (const game of GAMES) {
    const canonical = gameMap.get(game.id);
    if (!canonical || !gameArchive) continue;
    const duplicates = findGameCategories(guild, game).filter((category) => category.id !== canonical.id);
    for (const duplicate of duplicates.values()) {
      try {
        const children = guild.channels.cache.filter((channel) => channel.parentId === duplicate.id);
        for (const child of children.values()) {
          if (protectedChannel(guild, child)) continue;
          await retryOperation(() => child.setParent(gameArchive.id, { lockPermissions: false, reason: 'Community Architecture V3 archive duplicate game' }));
          await retryOperation(() => child.permissionOverwrites.set(buildV3Overwrites(guild, 'archive'), 'Community Architecture V3 game archive permission'));
          summary.archived.push(`${duplicate.name} / ${child.name}`);
          await sleep();
        }
        await retryOperation(() => duplicate.setName(`📦｜舊分類-${stripGameCategoryPrefix(duplicate.name)}`.slice(0, 100), 'Community Architecture V3 duplicate game marker'));
        await retryOperation(() => duplicate.permissionOverwrites.set(buildV3Overwrites(guild, 'archive'), 'Community Architecture V3 duplicate category permission'));
        summary.archived.push(duplicate.name);
      } catch (error) {
        summary.failed.push(`${duplicate.name} duplicate archive: ${error.message}`);
      }
    }
  }

  const managed = collectExpectedMatches(guild);
  const archive = categoryMap.get('old_archive');
  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory ||
        managed.has(channel.id) ||
        protectedChannel(guild, channel) ||
        channel.parentId === archive?.id ||
        channel.parentId === gameArchive?.id) continue;
    try {
      await retryOperation(() => channel.setParent(archive.id, { lockPermissions: false, reason: 'Community Architecture V3 archive old channel' }));
      await retryOperation(() => channel.permissionOverwrites.set(buildV3Overwrites(guild, 'archive'), 'Community Architecture V3 archive permission'));
      summary.archived.push(channel.name);
      await writeServerLog(guild, { title: '📦 V3 舊頻道封存', description: `${channel.name} -> ${archive.name}`, color: 0xf2c94c }).catch(() => null);
    } catch (error) {
      summary.failed.push(`${channel.name} archive: ${error.message}`);
    }
    await sleep();
  }

  await reorderV3(guild, categoryMap, gameMap, summary);
  await setupCommunityGuide(guild, { mode: 'refresh' }).catch((error) => summary.failed.push(`guide: ${error.message}`));
  if (client) {
    await setupChannelPanels({ client, guild, currentChannel: null, mode: 'refresh', target: 'all' })
      .catch((error) => summary.failed.push(`panels: ${error.message}`));
  }
  summary.validation = validateCommunityV3(guild);
  await writeServerLog(guild, {
    title: '✅ Community Architecture V3 完成',
    description: `created: ${summary.created.length}\nupdated: ${summary.updated.length}\narchived: ${summary.archived.length}\nfailed: ${summary.failed.length}`,
    color: summary.failed.length ? 0xf2c94c : 0x57f287
  }).catch(() => null);
  return summary;
}

function lines(items, mapper, empty = '無') {
  return items.length ? items.slice(0, 15).map(mapper).join('\n').slice(0, 1024) : empty;
}

function buildV3PreviewEmbed(plan) {
  const by = (type) => plan.actions.filter((item) => item.type === type);
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🏗️ Community Architecture V3')
    .setDescription(`版本：${plan.version}\n計畫：${plan.planId}\n不刪除頻道、不刪除訊息；非 V3 頻道移至舊頻道封存。`)
    .addFields(
      { name: '將建立', value: lines(plan.actions.filter((item) => item.type.startsWith('create_')), (item) => item.targetName) },
      { name: '將改名', value: lines(by('rename'), (item) => `${item.targetName} -> ${item.newName}`) },
      { name: '將搬移', value: lines(by('move'), (item) => `${item.targetName} -> ${item.targetCategory}`) },
      { name: '將封存', value: lines(plan.actions.filter((item) => ['archive', 'archive_game_category'].includes(item.type)), (item) => `${item.targetName} -> ${item.targetCategory}`) },
      { name: '將修權限', value: lines(by('sync_permission'), (item) => `${item.targetName} - ${item.permission}`) },
      { name: '遊戲分類', value: lines(plan.actions.filter((item) => ['create_game', 'repair_game'].includes(item.type)), (item) => `${item.targetName} - ${item.tier}`) },
      { name: '原生 Onboarding', value: ONBOARDING.nativeTaskChannelKeys.join('、') }
    )
    .setTimestamp();
}

module.exports = {
  buildCommunityV3Plan,
  buildV3PreviewEmbed,
  deleteV3Plan,
  executeCommunityV3,
  getV3Plan,
  saveV3Plan
};
