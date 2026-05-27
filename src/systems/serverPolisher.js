const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { CHANNEL_DESIGN } = require('../config/channelDesign');
const { ROLE_DESIGN } = require('../config/roleDesign');
const { SERVER_DESIGN_THEMES } = require('../config/serverDesignThemes');
const { COMMUNITY_STRUCTURE } = require('../config/communityStructure');
const { writeServerLog } = require('./serverLogs');

const pendingPolishPlans = new Map();
const STEP_DELAY_MS = 500;

function wait(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeName(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function roleAliasSet(config) {
  return new Set([config.name, ...(config.aliases || [])].map(normalizeName));
}

function channelAliasSet(config) {
  return new Set([config.name, ...(config.aliases || [])].map(normalizeName));
}

function findRoleForConfig(guild, config) {
  const aliases = roleAliasSet(config);
  return guild.roles.cache.find((role) => aliases.has(normalizeName(role.name))) || null;
}

function findCategory(guild, name) {
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name) || null;
}

function findChannelForConfig(guild, config) {
  const aliases = channelAliasSet(config);
  return guild.channels.cache.find((channel) => channel.type === config.type && aliases.has(normalizeName(channel.name))) || null;
}

function safeFieldList(items, empty = '無') {
  return items.length ? items.slice(0, 15).join('\n').slice(0, 1024) : empty;
}

function getManualNativeFeatureNotes() {
  return [
    'Membership Screening 目前需到 Discord Server Settings 手動開啟。',
    'Verification Level 建議設為 Medium 或 High，若 API 未成功請手動設定。',
    'Server Guide 建議加入：👋｜新人報到、✅｜身分組領取、🧭｜伺服器導覽、🎮｜目前語音房。',
    'Forum / Media Channel 本次不強行建立，建議依社群需求手動新增。'
  ];
}

function buildPolishPlan(guild, options) {
  const categoriesToCreate = [];
  const channelsToCreate = [];
  const channelsToMove = [];
  const channelsToRename = [];
  const rolesToCreate = [];
  const rolesToUpdate = [];
  const categoryOrder = CHANNEL_DESIGN.map((category) => category.name);

  for (const categoryConfig of CHANNEL_DESIGN) {
    const category = findCategory(guild, categoryConfig.name);
    if (!category) categoriesToCreate.push(categoryConfig.name);

    for (const channelConfig of categoryConfig.channels) {
      const channel = findChannelForConfig(guild, channelConfig);
      if (!channel) {
        channelsToCreate.push({
          categoryName: categoryConfig.name,
          channelName: channelConfig.name,
          type: channelConfig.type
        });
        continue;
      }

      if (channel.parent?.name !== categoryConfig.name) {
        channelsToMove.push({
          channelId: channel.id,
          channelName: channel.name,
          currentCategoryName: channel.parent?.name || '未分類',
          targetCategoryName: categoryConfig.name
        });
      }

      if (options.renameChannels && channel.name !== channelConfig.name) {
        channelsToRename.push({
          channelId: channel.id,
          from: channel.name,
          to: channelConfig.name
        });
      }
    }
  }

  if (options.polishRoles) {
    for (const roleConfig of ROLE_DESIGN) {
      const role = findRoleForConfig(guild, roleConfig);
      if (!role) {
        rolesToCreate.push(roleConfig);
        continue;
      }
      if (role.managed) continue;
      rolesToUpdate.push({
        roleId: role.id,
        from: role.name,
        to: roleConfig.name,
        color: roleConfig.color,
        hoist: roleConfig.hoist,
        mentionable: roleConfig.mentionable
      });
    }
  }

  return {
    guildId: guild.id,
    requestedById: options.requestedById,
    sourceChannelId: options.sourceChannelId,
    mode: options.mode,
    theme: options.theme,
    renameChannels: options.renameChannels,
    polishRoles: options.polishRoles,
    setupNativeFeatures: options.setupNativeFeatures,
    createdAt: Date.now(),
    categoriesToCreate,
    channelsToCreate,
    channelsToMove,
    channelsToRename,
    rolesToCreate: rolesToCreate.map((role) => role.name),
    rolesToUpdate,
    categoryOrder,
    manualNativeFeatureNotes: getManualNativeFeatureNotes(),
    riskNotes: [
      'preview 不會修改伺服器。',
      'execute 必須按確認後才會修改。',
      '不刪除未知角色或未知頻道。',
      '不操作 Discord managed roles。',
      '每次操作間隔 500ms，降低 rate limit 風險。'
    ]
  };
}

function buildPolishEmbed(plan) {
  const theme = SERVER_DESIGN_THEMES[plan.theme] || SERVER_DESIGN_THEMES.gaming_cozy;
  return new EmbedBuilder()
    .setColor(theme.accentColor)
    .setTitle('社群整體視覺與結構完善計畫')
    .setDescription(`${theme.name}：${theme.description}`)
    .addFields(
      { name: '將建立分類', value: safeFieldList(plan.categoriesToCreate) },
      { name: '將建立頻道', value: safeFieldList(plan.channelsToCreate.map((item) => `${item.categoryName} / ${item.channelName}`)) },
      { name: '將移動頻道', value: safeFieldList(plan.channelsToMove.map((item) => `${item.channelName}: ${item.currentCategoryName} -> ${item.targetCategoryName}`)) },
      { name: '將重新命名頻道', value: plan.renameChannels ? safeFieldList(plan.channelsToRename.map((item) => `${item.from} -> ${item.to}`)) : 'rename_channels=false' },
      { name: '將整理身分組', value: plan.polishRoles ? `建立 ${plan.rolesToCreate.length} 個，更新 ${plan.rolesToUpdate.length} 個` : 'polish_roles=false' },
      { name: 'Discord 原生功能', value: plan.setupNativeFeatures ? safeFieldList(plan.manualNativeFeatureNotes) : 'setup_native_features=false' },
      { name: '風險提醒', value: safeFieldList(plan.riskNotes) }
    )
    .setTimestamp();
}

function savePolishPlan(id, plan) {
  pendingPolishPlans.set(id, plan);
  setTimeout(() => pendingPolishPlans.delete(id), 15 * 60 * 1000);
}

function getPolishPlan(id) {
  return pendingPolishPlans.get(id) || null;
}

function deletePolishPlan(id) {
  pendingPolishPlans.delete(id);
}

function buildRoleOverwrites(guild, permissionKind, roles) {
  const everyone = guild.roles.everyone;
  const bot = guild.members.me;
  const adminRoles = [roles.owner, roles.admin, roles.mod].filter(Boolean);
  const formalRoles = [
    roles.verified,
    roles.game,
    roles.party,
    roles.invest,
    roles.dev,
    roles.design,
    roles.life,
    roles.announcement,
    roles.event
  ].filter(Boolean);

  const baseBotAllow = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.Connect
  ];
  const adminAllow = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.Connect
  ];

  const overwrites = [
    { id: bot.id, allow: baseBotAllow },
    ...adminRoles.map((role) => ({ id: role.id, allow: adminAllow }))
  ];

  if (permissionKind === 'entry') {
    overwrites.push({
      id: everyone.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      deny: [PermissionFlagsBits.MentionEveryone]
    });
    return overwrites;
  }

  if (permissionKind === 'admin' || permissionKind === 'archive') {
    overwrites.push({ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] });
    return overwrites;
  }

  overwrites.push({ id: everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.MentionEveryone] });

  if (permissionKind === 'verified') {
    overwrites.push(...formalRoles.map((role) => ({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect]
    })));
  }

  const permissionRoleMap = {
    game: [roles.game],
    invest: [roles.invest],
    dev: [roles.dev, roles.design]
  };
  for (const role of (permissionRoleMap[permissionKind] || []).filter(Boolean)) {
    overwrites.push({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect]
    });
  }

  return overwrites;
}

async function getOrCreateRole(guild, roleConfig, summary) {
  let role = findRoleForConfig(guild, roleConfig);
  if (role) return role;
  role = await guild.roles.create({
    name: roleConfig.name,
    color: roleConfig.color,
    hoist: roleConfig.hoist,
    mentionable: roleConfig.mentionable,
    permissions: [],
    reason: 'Server polish role setup'
  });
  summary.createdRoles.push(role.name);
  await wait();
  return role;
}

async function polishRoles(guild, summary) {
  const botMember = guild.members.me;
  const rolesByName = {};

  for (const roleConfig of ROLE_DESIGN) {
    let role = await getOrCreateRole(guild, roleConfig, summary);
    if (role.managed) {
      summary.skipped.push(`${role.name}: managed role`);
      continue;
    }
    if (!role.editable || botMember.roles.highest.comparePositionTo(role) <= 0) {
      summary.skipped.push(`${role.name}: Bot role position too low`);
      continue;
    }
    try {
      await role.edit({
        name: roleConfig.name,
        color: roleConfig.color,
        hoist: roleConfig.hoist,
        mentionable: roleConfig.mentionable
      }, 'Server polish role visual update');
      role = guild.roles.cache.get(role.id) || role;
      summary.updatedRoles.push(roleConfig.name);
      await wait();
    } catch (error) {
      summary.failed.push(`role ${roleConfig.name}: ${error.message}`);
    }
    rolesByName[roleConfig.name] = role;
  }

  await sortKnownRoles(guild, summary);
  return resolveKnownRoles(guild);
}

function resolveKnownRoles(guild) {
  return {
    owner: findRoleForConfig(guild, ROLE_DESIGN[0]),
    admin: findRoleForConfig(guild, ROLE_DESIGN[1]),
    mod: findRoleForConfig(guild, ROLE_DESIGN[2]),
    guest: findRoleForConfig(guild, ROLE_DESIGN[3]),
    verified: findRoleForConfig(guild, ROLE_DESIGN[4]),
    game: findRoleForConfig(guild, ROLE_DESIGN[6]),
    party: findRoleForConfig(guild, ROLE_DESIGN[7]),
    invest: findRoleForConfig(guild, ROLE_DESIGN[8]),
    dev: findRoleForConfig(guild, ROLE_DESIGN[9]),
    design: findRoleForConfig(guild, ROLE_DESIGN[10]),
    life: findRoleForConfig(guild, ROLE_DESIGN[11]),
    announcement: findRoleForConfig(guild, ROLE_DESIGN[12]),
    event: findRoleForConfig(guild, ROLE_DESIGN[13])
  };
}

async function sortKnownRoles(guild, summary) {
  const botMember = guild.members.me;
  const editableRoles = ROLE_DESIGN
    .map((roleConfig) => findRoleForConfig(guild, roleConfig))
    .filter((role) => role && !role.managed && role.editable && botMember.roles.highest.comparePositionTo(role) > 0);

  let position = Math.max(1, botMember.roles.highest.position - 1);
  for (const role of editableRoles) {
    try {
      await role.setPosition(position, { reason: 'Server polish role ordering' });
      position = Math.max(1, position - 1);
      await wait();
    } catch (error) {
      summary.skipped.push(`${role.name}: role position ${error.message}`);
    }
  }
}

async function ensureEveryonePermissions(guild, summary) {
  try {
    const everyone = guild.roles.everyone;
    const nextPermissions = everyone.permissions.remove(PermissionFlagsBits.MentionEveryone);
    await everyone.setPermissions(nextPermissions, 'Server polish: disable everyone MentionEveryone');
    summary.updatedRoles.push('@everyone MentionEveryone disabled');
    await wait();
  } catch (error) {
    summary.failed.push(`@everyone permissions: ${error.message}`);
  }
}

async function executePolish(guild, plan) {
  const summary = {
    createdCategories: [],
    createdChannels: [],
    movedChannels: [],
    renamedChannels: [],
    createdRoles: [],
    updatedRoles: [],
    syncedChannels: [],
    nativeUpdates: [],
    manualNativeFeatureNotes: plan.manualNativeFeatureNotes,
    skipped: [],
    failed: []
  };

  const roles = plan.polishRoles ? await polishRoles(guild, summary) : resolveKnownRoles(guild);
  await ensureEveryonePermissions(guild, summary);

  const categoryMap = new Map();
  for (let categoryIndex = 0; categoryIndex < CHANNEL_DESIGN.length; categoryIndex += 1) {
    const categoryConfig = CHANNEL_DESIGN[categoryIndex];
    let category = findCategory(guild, categoryConfig.name);
    try {
      if (!category) {
        category = await guild.channels.create({
          name: categoryConfig.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: buildRoleOverwrites(guild, categoryConfig.permission, roles),
          reason: 'Server polish category setup'
        });
        summary.createdCategories.push(category.name);
        await wait();
      } else {
        await category.permissionOverwrites.set(buildRoleOverwrites(guild, categoryConfig.permission, roles), 'Server polish category permissions');
        await wait();
      }
      await category.setPosition(categoryIndex, { reason: 'Server polish category ordering' }).catch(() => null);
    } catch (error) {
      summary.failed.push(`category ${categoryConfig.name}: ${error.message}`);
      continue;
    }

    categoryMap.set(categoryConfig.name, category);

    for (let channelIndex = 0; channelIndex < categoryConfig.channels.length; channelIndex += 1) {
      const channelConfig = categoryConfig.channels[channelIndex];
      let channel = findChannelForConfig(guild, channelConfig);
      try {
        if (!channel) {
          channel = await guild.channels.create({
            name: channelConfig.name,
            type: channelConfig.type,
            parent: category.id,
            reason: 'Server polish channel setup'
          });
          summary.createdChannels.push(channel.name);
          await wait();
        }

        if (plan.renameChannels && channel.name !== channelConfig.name) {
          await channel.setName(channelConfig.name, 'Server polish channel naming');
          summary.renamedChannels.push(`${channel.name} -> ${channelConfig.name}`);
          await wait();
        }

        if (channel.parentId !== category.id) {
          await channel.setParent(category.id, { lockPermissions: true, reason: 'Server polish channel placement' });
          summary.movedChannels.push(`${channel.name} -> ${category.name}`);
          await wait();
        } else {
          await channel.lockPermissions().catch((error) => summary.skipped.push(`${channel.name}: ${error.message}`));
          summary.syncedChannels.push(channel.name);
        }

        await channel.setPosition(channelIndex, { reason: 'Server polish channel ordering' }).catch(() => null);
      } catch (error) {
        summary.failed.push(`channel ${channelConfig.name}: ${error.message}`);
      }
    }
  }

  if (plan.setupNativeFeatures) {
    await setupNativeFeatures(guild, summary);
  }

  await writeServerLog(guild, {
    title: '✨ 社群視覺與結構完善完成',
    color: (SERVER_DESIGN_THEMES[plan.theme] || SERVER_DESIGN_THEMES.gaming_cozy).accentColor,
    fields: [
      { name: '分類', value: `${summary.createdCategories.length} created`, inline: true },
      { name: '頻道', value: `${summary.createdChannels.length} created / ${summary.movedChannels.length} moved`, inline: true },
      { name: '身分組', value: `${summary.createdRoles.length} created / ${summary.updatedRoles.length} updated`, inline: true },
      { name: '失敗', value: safeFieldList(summary.failed) }
    ]
  });

  return summary;
}

async function setupNativeFeatures(guild, summary) {
  const rulesChannel = guild.channels.cache.find((channel) => channel.name === '📜｜社群規則');
  const announcementChannel = guild.channels.cache.find((channel) => channel.name === '📢｜公告');
  const serverLogs = guild.channels.cache.find((channel) => channel.name.includes('server-logs'));

  if (!guild.features.includes('COMMUNITY')) {
    summary.manualNativeFeatureNotes.push('此伺服器尚未啟用 Community，請先到 Discord Server Settings 手動啟用。');
    return;
  }

  try {
    if (rulesChannel && typeof guild.setRulesChannel === 'function') {
      await guild.setRulesChannel(rulesChannel, 'Server polish native rules channel');
      summary.nativeUpdates.push('rules channel');
      await wait();
    }
  } catch (error) {
    summary.failed.push(`rules channel: ${error.message}`);
  }

  try {
    const updatesChannel = announcementChannel || serverLogs;
    if (updatesChannel && typeof guild.setPublicUpdatesChannel === 'function') {
      await guild.setPublicUpdatesChannel(updatesChannel, 'Server polish native updates channel');
      summary.nativeUpdates.push('public updates channel');
      await wait();
    }
  } catch (error) {
    summary.failed.push(`public updates channel: ${error.message}`);
  }
}

module.exports = {
  COMMUNITY_STRUCTURE,
  STEP_DELAY_MS,
  buildPolishEmbed,
  buildPolishPlan,
  deletePolishPlan,
  executePolish,
  getPolishPlan,
  savePolishPlan
};
