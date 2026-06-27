const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getTemplate, getOrCreateLogChannel, createTemplateStructure } = require('../../systems/serverRebuilder');
const { setupChannelPanels } = require('../../systems/channelPanels');
const { SELF_ASSIGNABLE_ROLES, setupSelfAssignableRoles } = require('../../systems/roleManager');
const { applyPermissionPlan } = require('../../systems/rolePermissions');
const { buildRolePlan } = require('../../services/community/communityPermissionService');
const { isActiveProtectedChannel } = require('../../systems/activeChannelProtector');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PANELS_FILE = path.join(DATA_DIR, 'channel-panels.json');
const TEMP_VOICE_FILE = path.join(DATA_DIR, 'temp-voice.json');
const MEMORY_FILE = path.join(DATA_DIR, 'server-memory.json');

const pendingFactoryResetPlans = new Map();
const MAX_CHANNEL_DELETES = 50;
const MAX_CATEGORY_DELETES = 20;
const BOT_CATEGORY_PREFIXES = ['📌｜', '💬｜', '🎮｜', '🛠｜', '📈｜', '🎉｜', '🎫｜', '🔒｜', '📦｜'];
const BOT_CHANNEL_PATTERNS = [
  /^ticket-/i,
  /^temp-/i,
  /^server-logs$/i,
  /^ticket-logs$/i,
  /^bot-control$/i,
  /開啟客服單/i,
  /建立.*語音/i
];
const ADMIN_TEXT_PATTERN = /管理員|admin|server-logs|ticket-logs|bot-control|整理紀錄/i;
const HIGH_PERMISSION_BITS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageChannels
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureJsonFile(filePath) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}', 'utf8');
}

function readJsonFile(filePath) {
  ensureJsonFile(filePath);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writeJsonFile(filePath, data) {
  ensureJsonFile(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function clearGuildJsonEntry(filePath, guildId) {
  const data = readJsonFile(filePath);
  const hadData = Boolean(data[guildId]);
  delete data[guildId];
  writeJsonFile(filePath, data);
  return hadData;
}

function readGuildRecordIds(filePath, guildId) {
  const data = readJsonFile(filePath);
  return data[guildId] && typeof data[guildId] === 'object' ? data[guildId] : {};
}

function isBotTemplateCategory(channel) {
  return channel.type === ChannelType.GuildCategory &&
    BOT_CATEGORY_PREFIXES.some((prefix) => channel.name.startsWith(prefix));
}

function isBotNamedChannel(channel) {
  return BOT_CHANNEL_PATTERNS.some((pattern) => pattern.test(channel.name));
}

function isAdminProtectedChannel(channel, plan) {
  if (!plan.keepAdmin && !plan.keepLogs) return false;
  const text = `${channel.name} ${channel.parent ? channel.parent.name : ''}`;
  if (plan.keepLogs && /server-logs|ticket-logs/i.test(text)) return true;
  if (plan.keepAdmin && ADMIN_TEXT_PATTERN.test(text)) return true;
  return false;
}

function isDiscordProtectedChannel(guild, channel, sourceChannelId) {
  if (channel.id === sourceChannelId) return '正在執行指令的頻道';
  if (channel.id === guild.systemChannelId) return 'Discord system channel';
  if (channel.id === guild.rulesChannelId) return 'Community rules channel';
  return null;
}

function getTemplateNames(templateName) {
  const template = getTemplate(templateName);
  const categories = new Set();
  const channels = new Set();
  for (const category of template.categories) {
    categories.add(category.name);
    for (const channel of category.channels) channels.add(channel.name);
  }
  return { categories, channels };
}

function getPanelMessageTargets(guildId) {
  const records = readGuildRecordIds(PANELS_FILE, guildId);
  return Object.entries(records).map(([channelId, record]) => ({
    channelId,
    messageId: record.messageId,
    panelType: record.panelType
  }));
}

function getTempVoiceIds(guildId) {
  return new Set(Object.keys(readGuildRecordIds(TEMP_VOICE_FILE, guildId)));
}

function classifyChannel(channel, plan, templateNames, panelChannelIds, tempVoiceIds) {
  const protectedReason = isDiscordProtectedChannel(channel.guild, channel, plan.sourceChannelId);
  if (protectedReason) return { protectedReason };
  if (isAdminProtectedChannel(channel, plan)) return { protectedReason: '保留管理員或 logs 頻道' };
  if (isActiveProtectedChannel(channel)) return { protectedReason: '有效生活/遊戲頻道，不刪除' };
  if (channel.type === ChannelType.GuildCategory) return { protectedReason: '分類會在子頻道處理後另外判斷' };

  if (tempVoiceIds.has(channel.id)) return { deleteReason: 'temp-voice.json 記錄的臨時語音' };
  if (isBotNamedChannel(channel)) return { deleteReason: '符合 Bot 產生頻道命名規則' };
  if (templateNames.channels.has(channel.name)) return { deleteReason: '符合新版模板頻道名稱' };
  if (channel.parent && isBotTemplateCategory(channel.parent)) return { deleteReason: '位於 Bot 模板分類內' };
  if (panelChannelIds.has(channel.id) && (isBotNamedChannel(channel) || channel.parent && isBotTemplateCategory(channel.parent))) {
    return { deleteReason: '有 panel 記錄且位於 Bot 結構內' };
  }

  return { protectedReason: '不符合 Bot 建立內容判定，視為手動頻道' };
}

function classifyCategory(category, plan, templateNames) {
  const protectedReason = isDiscordProtectedChannel(category.guild, category, plan.sourceChannelId);
  if (protectedReason) return { protectedReason };
  if (isAdminProtectedChannel(category, plan)) return { protectedReason: '保留管理員分類' };
  if (templateNames.categories.has(category.name) || isBotTemplateCategory(category)) {
    return { deleteReason: '符合 Bot 模板分類' };
  }
  return { protectedReason: '非 Bot 模板分類' };
}

function buildFactoryResetPlan(guild, options) {
  const templateNames = getTemplateNames(options.rebuildTemplate);
  const panelTargets = getPanelMessageTargets(guild.id);
  const panelChannelIds = new Set(panelTargets.map((item) => item.channelId));
  const tempVoiceIds = getTempVoiceIds(guild.id);
  const deleteChannels = [];
  const deleteCategories = [];
  const keepChannels = [];
  const keepRoles = [];
  const deleteRoles = [];

  const basePlan = {
    guildId: guild.id,
    requestedById: options.requestedById,
    sourceChannelId: options.sourceChannelId,
    mode: options.mode,
    rebuildTemplate: options.rebuildTemplate,
    keepAdmin: options.keepAdmin,
    keepLogs: options.keepLogs,
    removeRoles: options.removeRoles,
    createdAt: Date.now()
  };

  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory) continue;
    const result = classifyChannel(channel, basePlan, templateNames, panelChannelIds, tempVoiceIds);
    if (result.deleteReason && deleteChannels.length < MAX_CHANNEL_DELETES) {
      deleteChannels.push({
        channelId: channel.id,
        channelName: channel.name,
        type: channel.type,
        reason: result.deleteReason
      });
    } else {
      keepChannels.push({
        channelId: channel.id,
        channelName: channel.name,
        reason: result.protectedReason || '超過單次刪除上限'
      });
    }
  }

  for (const category of guild.channels.cache.filter((item) => item.type === ChannelType.GuildCategory).values()) {
    const result = classifyCategory(category, basePlan, templateNames);
    if (result.deleteReason && deleteCategories.length < MAX_CATEGORY_DELETES) {
      deleteCategories.push({
        categoryId: category.id,
        categoryName: category.name,
        reason: result.deleteReason
      });
    } else {
      keepChannels.push({
        channelId: category.id,
        channelName: category.name,
        reason: result.protectedReason || '超過單次分類刪除上限'
      });
    }
  }

  for (const roleName of SELF_ASSIGNABLE_ROLES) {
    const role = guild.roles.cache.find((item) => item.name === roleName);
    if (!role) continue;
    const highPermission = HIGH_PERMISSION_BITS.some((bit) => role.permissions.has(bit));
    if (options.removeRoles && role.editable && !highPermission) {
      deleteRoles.push({ roleId: role.id, roleName: role.name, reason: 'Bot 建立的自助身分組' });
    } else {
      keepRoles.push({ roleId: role.id, roleName: role.name, reason: highPermission ? '高權限角色保護' : 'remove_roles=false 或 Bot 無法管理' });
    }
  }

  return {
    ...basePlan,
    panelTargets,
    deleteChannels,
    deleteCategories,
    deleteRoles,
    keepChannels,
    keepRoles,
    riskNotes: [
      'preview 不會修改任何內容',
      'execute 必須按下二次確認按鈕才會開始',
      '刪除前會先 rename 為 deleting-原名稱，等待 1 秒後刪除',
      `單次最多刪除 ${MAX_CHANNEL_DELETES} 個頻道、${MAX_CATEGORY_DELETES} 個分類`,
      '不刪除 Discord system channel、Community rules channel、指令所在頻道'
    ]
  };
}

function truncate(value, max = 1024) {
  if (!value) return '無';
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function list(items, mapper) {
  if (!items.length) return '無';
  return items.map(mapper).join('\n');
}

function buildFactoryResetEmbed(plan) {
  return new EmbedBuilder()
    .setColor(plan.mode === 'execute' ? 0xeb5757 : 0xf2c94c)
    .setTitle('⚠️ 伺服器工廠重置預覽')
    .setDescription(
      `mode：${plan.mode}\n` +
      `rebuild_template：${plan.rebuildTemplate}\n` +
      `keep_admin：${plan.keepAdmin}\n` +
      `keep_logs：${plan.keepLogs}\n` +
      `remove_roles：${plan.removeRoles}`
    )
    .addFields(
      { name: '將刪除的分類', value: truncate(list(plan.deleteCategories, (item) => `• ${item.categoryName}：${item.reason}`)) },
      { name: '將刪除的頻道', value: truncate(list(plan.deleteChannels, (item) => `• ${item.channelName}：${item.reason}`)) },
      { name: '將保留的頻道/分類', value: truncate(list(plan.keepChannels.slice(0, 20), (item) => `• ${item.channelName}：${item.reason}`)) },
      { name: '將保留的角色', value: truncate(list(plan.keepRoles, (item) => `• ${item.roleName}：${item.reason}`)) },
      { name: '將刪除的角色', value: truncate(list(plan.deleteRoles, (item) => `• ${item.roleName}：${item.reason}`)) },
      { name: '將重建的模板', value: plan.rebuildTemplate },
      { name: '風險警告', value: truncate(list(plan.riskNotes, (note) => `• ${note}`)) }
    )
    .setFooter({ text: `Plan ID: ${plan.createdAt}` })
    .setTimestamp();
}

async function deletePanelMessages(guild, plan, summary) {
  for (const item of plan.panelTargets) {
    try {
      const channel = guild.channels.cache.get(item.channelId);
      if (!channel || !channel.isTextBased()) continue;
      const message = await channel.messages.fetch(item.messageId).catch(() => null);
      if (!message || message.author.id !== guild.client.user.id) continue;
      await message.delete();
      summary.deletedPanelMessages.push(`${channel.name}/${item.messageId}`);
    } catch (error) {
      summary.failed.push(`刪除 panel 訊息失敗：${item.messageId} (${error.message})`);
    }
  }
}

async function renameThenDeleteChannel(channel, reason) {
  const nextName = `deleting-${channel.name}`.slice(0, 90);
  await channel.setName(nextName, reason);
  await sleep(1000);
  await channel.delete(reason);
}

async function deleteChannels(guild, plan, summary) {
  for (const item of plan.deleteChannels.slice(0, MAX_CHANNEL_DELETES)) {
    const channel = guild.channels.cache.get(item.channelId);
    if (!channel) continue;
    const protectedReason = isDiscordProtectedChannel(guild, channel, plan.sourceChannelId);
    if (protectedReason || isAdminProtectedChannel(channel, plan)) {
      summary.skipped.push(`${item.channelName}：${protectedReason || '保護管理員/logs 頻道'}`);
      continue;
    }

    try {
      await renameThenDeleteChannel(channel, `Factory reset: ${item.reason}`);
      summary.deletedChannels.push(item.channelName);
    } catch (error) {
      summary.failed.push(`刪除頻道失敗：${item.channelName} (${error.message})`);
    }
  }
}

async function deleteCategories(guild, plan, summary) {
  for (const item of plan.deleteCategories.slice(0, MAX_CATEGORY_DELETES)) {
    const category = guild.channels.cache.get(item.categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) continue;
    if (isAdminProtectedChannel(category, plan)) {
      summary.skipped.push(`${item.categoryName}：保護管理員分類`);
      continue;
    }
    const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
    if (children.size > 0) {
      summary.skipped.push(`${item.categoryName}：仍有 ${children.size} 個子頻道`);
      continue;
    }

    try {
      await renameThenDeleteChannel(category, `Factory reset category cleanup: ${item.reason}`);
      summary.deletedCategories.push(item.categoryName);
    } catch (error) {
      summary.failed.push(`刪除分類失敗：${item.categoryName} (${error.message})`);
    }
  }
}

async function deleteRoles(guild, plan, summary) {
  if (!plan.removeRoles) return;
  for (const item of plan.deleteRoles) {
    const role = guild.roles.cache.get(item.roleId);
    if (!role) continue;
    const highPermission = HIGH_PERMISSION_BITS.some((bit) => role.permissions.has(bit));
    if (!role.editable || highPermission) {
      summary.skipped.push(`${item.roleName}：角色受保護或 Bot 無法管理`);
      continue;
    }

    try {
      await role.delete('Factory reset self assignable role cleanup');
      summary.deletedRoles.push(item.roleName);
    } catch (error) {
      summary.failed.push(`刪除角色失敗：${item.roleName} (${error.message})`);
    }
  }
}

async function rebuildAfterReset(interaction, plan, summary) {
  const template = getTemplate(plan.rebuildTemplate);
  await createTemplateStructure(interaction.guild, template, summary.rebuild);
  await setupChannelPanels({
    client: interaction.client,
    guild: interaction.guild,
    currentChannel: interaction.channel,
    mode: 'create',
    target: 'all'
  });
  summary.roles = await setupSelfAssignableRoles(interaction.guild);
  const permissionResult = buildRolePlan(interaction.guild, interaction.user.id);
  if (!permissionResult.ok) throw new Error(permissionResult.error.message);
  const permissionPlan = permissionResult.data;
  permissionPlan.mode = 'execute';
  summary.permissions = await applyPermissionPlan(interaction.guild, permissionPlan);
}

async function executeFactoryReset(interaction, plan) {
  const guild = interaction.guild;
  const summary = {
    deletedPanelMessages: [],
    deletedChannels: [],
    deletedCategories: [],
    deletedRoles: [],
    skipped: [],
    failed: [],
    clearedData: [],
    rebuild: {
      createdCategories: [],
      createdChannels: [],
      failed: []
    },
    roles: null,
    permissions: null
  };

  const logChannel = await getOrCreateLogChannel(guild);
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0xeb5757)
        .setTitle('Factory reset started')
        .setDescription(`executor：${interaction.user}\ntemplate：${plan.rebuildTemplate}`)
        .setTimestamp()
    ]
  });

  await deletePanelMessages(guild, plan, summary);
  await deleteChannels(guild, plan, summary);
  await deleteCategories(guild, plan, summary);
  await deleteRoles(guild, plan, summary);

  for (const [label, filePath] of [
    ['channel-panels.json', PANELS_FILE],
    ['temp-voice.json', TEMP_VOICE_FILE],
    ['server-memory.json', MEMORY_FILE]
  ]) {
    try {
      if (clearGuildJsonEntry(filePath, guild.id)) summary.clearedData.push(label);
    } catch (error) {
      summary.failed.push(`清空 ${label} 失敗：${error.message}`);
    }
  }

  try {
    await rebuildAfterReset(interaction, plan, summary);
  } catch (error) {
    summary.failed.push(`重建模板或後續設定失敗：${error.message}`);
  }

  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(summary.failed.length ? 0xf2c94c : 0x27ae60)
        .setTitle('Factory reset finished')
        .addFields(
          { name: 'Deleted channels', value: truncate(summary.deletedChannels.join('\n')) },
          { name: 'Deleted categories', value: truncate(summary.deletedCategories.join('\n')) },
          { name: 'Deleted roles', value: truncate(summary.deletedRoles.join('\n')) },
          { name: 'Rebuild created', value: truncate([...summary.rebuild.createdCategories, ...summary.rebuild.createdChannels].join('\n')) },
          { name: 'Skipped / Failed', value: truncate([...summary.skipped, ...summary.failed].join('\n')) }
        )
        .setTimestamp()
    ]
  }).catch(() => null);

  return summary;
}

function saveFactoryResetPlan(id, plan) {
  pendingFactoryResetPlans.set(id, plan);
}

function getFactoryResetPlan(id) {
  return pendingFactoryResetPlans.get(id);
}

function deleteFactoryResetPlan(id) {
  pendingFactoryResetPlans.delete(id);
}

module.exports = {
  buildFactoryResetEmbed,
  buildFactoryResetPlan,
  deleteFactoryResetPlan,
  executeFactoryReset,
  getFactoryResetPlan,
  saveFactoryResetPlan
};
