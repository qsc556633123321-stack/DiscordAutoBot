const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const templates = require('../config/rebuildTemplates');
const { isTempVoice } = require('./tempVoice');
const { isCreateVoiceChannel } = require('./gameChannels');
const { setupChannelPanels } = require('./channelPanels');
const { cleanupEmptyCategories } = require('./categoryCleaner');

const pendingRebuildPlans = new Map();
const MAX_DELETE_OLD_CHANNELS = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTemplate(templateName) {
  return templates[templateName] || templates.mixed_community;
}

function getTemplateChannelNames(template) {
  const names = new Set();
  for (const category of template.categories) {
    names.add(category.name);
    for (const channel of category.channels) names.add(channel.name);
  }
  return names;
}

function isAdminChannel(channel) {
  const text = `${channel.name} ${channel.parent ? channel.parent.name : ''}`;
  return /管理|後台|admin|server-logs|ticket-logs|bot-control|整理紀錄/i.test(text);
}

function isProtectedOldChannel(channel, plan) {
  if (channel.id === plan.sourceChannelId) return '正在執行指令的頻道';
  if (channel.name.startsWith('ticket-')) return 'ticket 私人客服單';
  if (isCreateVoiceChannel(channel)) return '建立語音入口';
  if (channel.guild && isTempVoice(channel.guild.id, channel.id)) return '臨時語音由 tempVoice 管理';
  if (plan.keepAdmin && isAdminChannel(channel)) return '保留管理員頻道';
  return null;
}

function createRebuildPlan(guild, options) {
  const template = getTemplate(options.template);
  const templateNames = getTemplateChannelNames(template);
  const channels = [...guild.channels.cache.values()];
  const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory);
  const categoryNames = new Set(categories.map((category) => category.name));
  const channelNames = new Set(channels.map((channel) => channel.name));
  const categoriesToCreate = template.categories
    .filter((category) => !categoryNames.has(category.name))
    .map((category) => category.name);
  const channelsToCreate = [];

  for (const category of template.categories) {
    for (const channel of category.channels) {
      if (!channelNames.has(channel.name)) {
        channelsToCreate.push({
          categoryName: category.name,
          channelName: channel.name,
          type: channel.type
        });
      }
    }
  }

  const oldChannels = [];
  const protectedChannels = [];

  for (const channel of channels) {
    if (templateNames.has(channel.name)) continue;
    if (channel.type === ChannelType.GuildCategory) continue;

    const protectedReason = isProtectedOldChannel(channel, {
      ...options,
      sourceChannelId: options.sourceChannelId
    });
    if (protectedReason) {
      protectedChannels.push({ channelId: channel.id, channelName: channel.name, reason: protectedReason });
      continue;
    }

    oldChannels.push({
      channelId: channel.id,
      channelName: channel.name,
      currentCategoryName: channel.parent ? channel.parent.name : '無分類'
    });
  }

  return {
    guildId: guild.id,
    requestedById: options.requestedById,
    sourceChannelId: options.sourceChannelId,
    templateName: options.template,
    mode: options.mode,
    oldChannelsMode: options.oldChannels,
    keepAdmin: options.keepAdmin,
    createdAt: Date.now(),
    categoriesToCreate,
    channelsToCreate,
    oldChannels,
    deleteCandidates: options.oldChannels === 'delete' ? oldChannels.slice(0, MAX_DELETE_OLD_CHANNELS) : [],
    protectedChannels,
    riskNotes: [
      'preview 不會執行任何變更。',
      'execute 仍必須按下二次確認按鈕才會執行。',
      'delete 模式最多刪除 10 個舊頻道，且不刪除受保護頻道。',
      '所有動作會記錄到 server-logs。'
    ]
  };
}

function saveRebuildPlan(id, plan) {
  pendingRebuildPlans.set(id, plan);
}

function getRebuildPlan(id) {
  return pendingRebuildPlans.get(id);
}

function deleteRebuildPlan(id) {
  pendingRebuildPlans.delete(id);
}

async function getOrCreateCategory(guild, name, options = {}) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
  );
  if (existing) return { channel: existing, created: false };

  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: options.permissionOverwrites,
    reason: 'Server rebuild setup'
  });
  return { channel, created: true };
}

function buildHiddenArchiveOverwrites(guild) {
  const ownerRole = guild.roles.cache.find((role) => role.name === '站長');
  const adminRole = guild.roles.cache.find((role) => role.name === '管理員');
  const overwrites = [{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }];
  for (const role of [ownerRole, adminRole].filter(Boolean)) {
    overwrites.push({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages
      ]
    });
  }
  return overwrites;
}

async function getOrCreateLogChannel(guild) {
  const adminCategoryResult = await getOrCreateCategory(guild, '🔒｜管理員後台');
  const adminCategory = adminCategoryResult.channel;
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && ['server-logs', '📑｜server-logs'].includes(channel.name)
  );
  if (existing) return existing;

  return guild.channels.create({
    name: '📑｜server-logs',
    type: ChannelType.GuildText,
    parent: adminCategory.id,
    reason: 'Server rebuild log setup'
  });
}

async function createTemplateStructure(guild, template, summary) {
  const categoryMap = new Map();

  for (const categoryConfig of template.categories) {
    let category;
    try {
      const result = await getOrCreateCategory(guild, categoryConfig.name);
      category = result.channel;
      if (result.created) summary.createdCategories.push(categoryConfig.name);
    } catch (error) {
      console.error(`建立分類 ${categoryConfig.name} 失敗：`, error);
      summary.failed.push(`建立分類失敗：${categoryConfig.name}`);
      continue;
    }
    categoryMap.set(categoryConfig.name, category);

    for (const channelConfig of categoryConfig.channels) {
      const type = channelConfig.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
      const existing = guild.channels.cache.find(
        (channel) => channel.type === type && channel.name === channelConfig.name
      );
      if (existing) {
        if (existing.parentId !== category.id) {
          try {
            await existing.setParent(category.id, {
              lockPermissions: false,
              reason: 'Server rebuild move existing template channel to correct category'
            });
          } catch (error) {
            console.error(`移動既有頻道 ${existing.name} 失敗：`, error);
            summary.failed.push(`移動既有頻道失敗：${existing.name}`);
          }
        }
        continue;
      }

      try {
        const created = await guild.channels.create({
          name: channelConfig.name,
          type,
          parent: category.id,
          userLimit: channelConfig.userLimit,
          reason: 'Server rebuild template channel setup'
        });
        summary.createdChannels.push(created.name);
      } catch (error) {
        console.error(`建立頻道 ${channelConfig.name} 失敗：`, error);
        summary.failed.push(`建立頻道失敗：${channelConfig.name}`);
      }
    }
  }

  return categoryMap;
}

async function handleOldChannels(guild, plan, summary) {
  const archiveName = plan.oldChannelsMode === 'hide' ? '📦｜隱藏舊頻道封存' : '📦｜舊頻道封存';
  const archiveResult = await getOrCreateCategory(guild, archiveName, {
    permissionOverwrites: plan.oldChannelsMode === 'hide' ? buildHiddenArchiveOverwrites(guild) : undefined
  });
  const archive = archiveResult.channel;

  if (plan.oldChannelsMode === 'delete') {
    for (const item of plan.deleteCandidates.slice(0, MAX_DELETE_OLD_CHANNELS)) {
      const channel = guild.channels.cache.get(item.channelId);
      if (!channel) continue;
      const protectedReason = isProtectedOldChannel(channel, plan);
      if (protectedReason) {
        summary.skipped.push(`${channel.name}：${protectedReason}`);
        continue;
      }

      try {
        await channel.setName(`delete-pending-${channel.name}`.slice(0, 90), 'Server rebuild delete pending');
        await sleep(5000);
        await channel.delete('Server rebuild old channel delete confirmed');
        summary.deletedOldChannels.push(item.channelName);
      } catch (error) {
        console.error(`刪除舊頻道 ${item.channelName} 失敗：`, error);
        summary.failed.push(`刪除失敗：${item.channelName}`);
      }
    }
    return;
  }

  for (const item of plan.oldChannels) {
    const channel = guild.channels.cache.get(item.channelId);
    if (!channel) continue;
    const protectedReason = isProtectedOldChannel(channel, plan);
    if (protectedReason) {
      summary.skipped.push(`${channel.name}：${protectedReason}`);
      continue;
    }

    try {
        await channel.setParent(archive.id, {
        lockPermissions: plan.oldChannelsMode === 'hide',
        reason: 'Server rebuild old channel archive'
      });
      summary.archivedOldChannels.push(channel.name);
    } catch (error) {
      console.error(`封存舊頻道 ${item.channelName} 失敗：`, error);
      summary.failed.push(`封存失敗：${item.channelName}`);
    }
  }
}

async function executeRebuild(interaction, plan) {
  const guild = interaction.guild;
  const template = getTemplate(plan.templateName);
  const summary = {
    createdCategories: [],
    createdChannels: [],
    archivedOldChannels: [],
    deletedOldChannels: [],
    skipped: [],
    failed: []
  };

  const logChannel = await getOrCreateLogChannel(guild);
  await createTemplateStructure(guild, template, summary);
  await handleOldChannels(guild, plan, summary);
  try {
    summary.categoryCleanup = await cleanupEmptyCategories(guild, {
      deleteLevel: plan.oldChannelsMode === 'delete' ? 'normal' : 'safe'
    });
  } catch (error) {
    console.error('rebuild 後清理空分類失敗：', error);
    summary.failed.push('清理空分類失敗');
  }
  await setupChannelPanels({
    client: interaction.client,
    guild,
    currentChannel: interaction.channel,
    mode: 'create',
    target: 'all'
  });

  try {
    const embed = new EmbedBuilder()
      .setColor(0xeb5757)
      .setTitle('一鍵大洗牌完成紀錄')
      .setDescription(`執行者：${interaction.user}\ntemplate：${plan.templateName}\nold_channels：${plan.oldChannelsMode}`)
      .addFields(
        { name: '建立分類', value: summary.createdCategories.join('、') || '無' },
        { name: '建立頻道', value: summary.createdChannels.slice(0, 20).join('\n') || '無' },
        { name: '封存舊頻道', value: summary.archivedOldChannels.slice(0, 20).join('\n') || '無' },
        { name: '刪除舊頻道', value: summary.deletedOldChannels.join('、') || '無' },
        {
          name: '空分類清理',
          value: summary.categoryCleanup
            ? `封存/改名：${summary.categoryCleanup.renamed.length}\n刪除：${summary.categoryCleanup.deleted.length}`
            : '無'
        },
        { name: '略過/失敗', value: [...summary.skipped, ...summary.failed].slice(0, 20).join('\n') || '無' }
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('發送 rebuild log 失敗：', error);
  }

  return summary;
}

module.exports = {
  MAX_DELETE_OLD_CHANNELS,
  createRebuildPlan,
  createTemplateStructure,
  deleteRebuildPlan,
  executeRebuild,
  getOrCreateLogChannel,
  getRebuildPlan,
  getTemplate,
  saveRebuildPlan
};
