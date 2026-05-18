const { ChannelType, EmbedBuilder } = require('discord.js');
const { ARCHIVE_CATEGORY, MAX_DELETE_COUNT, MAX_MOVE_COUNT } = require('./deepCleanupPlanner');
const { isCreateVoiceChannel } = require('./gameChannels');
const { isTempVoice } = require('./tempVoice');
const { cleanupEmptyCategories } = require('./categoryCleaner');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncateName(name) {
  return name.slice(0, 90);
}

async function getOrCreateCategory(guild, name, createdCategories, failedOperations) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
  );
  if (existing) return existing;

  try {
    const category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory,
      reason: 'Deep cleanup category setup'
    });
    createdCategories.push(name);
    return category;
  } catch (error) {
    console.error(`建立分類 ${name} 失敗：`, error);
    failedOperations.push(`建立分類失敗：${name}`);
    return null;
  }
}

async function getOrCreateLogChannel(guild, categoriesByName, createdCategories, failedOperations) {
  let logChannel = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && ['server-logs', '📑｜ticket-logs'].includes(channel.name)
  );
  if (logChannel) return logChannel;

  const adminCategory = await getOrCreateCategory(guild, '🔒｜管理員後台', createdCategories, failedOperations);

  try {
    logChannel = await guild.channels.create({
      name: 'server-logs',
      type: ChannelType.GuildText,
      parent: adminCategory ? adminCategory.id : undefined,
      reason: 'Deep cleanup log channel setup'
    });
    categoriesByName.set('🔒｜管理員後台', adminCategory);
    return logChannel;
  } catch (error) {
    console.error('建立 server-logs 失敗：', error);
    failedOperations.push('建立 server-logs 失敗');
    return null;
  }
}

async function moveChannel(guild, item, categoriesByName, movedChannels, failedOperations, reason) {
  const channel = guild.channels.cache.get(item.channelId);
  const targetCategory = categoriesByName.get(item.targetCategoryName);

  if (!channel || !targetCategory) {
    failedOperations.push(`搬移失敗：${item.channelName}`);
    return;
  }

  if (channel.name.startsWith('ticket-')) return;
  if (channel.parentId === targetCategory.id) return;

  try {
    await channel.setParent(targetCategory.id, {
      lockPermissions: false,
      reason
    });
    movedChannels.push(`${channel.name} -> ${targetCategory.name}`);
  } catch (error) {
    console.error(`搬移 ${item.channelName} 失敗：`, error);
    failedOperations.push(`搬移失敗：${item.channelName}`);
  }
}

async function deleteChannelSafely(guild, item, deletedChannels, failedOperations, reason) {
  const channel = guild.channels.cache.get(item.channelId);
  if (!channel || channel.name.startsWith('ticket-')) return;
  if (isCreateVoiceChannel(channel)) return;
  if (channel.type === ChannelType.GuildVoice && !isTempVoice(guild.id, channel.id)) return;

  try {
    const pendingName = truncateName(`delete-pending-${channel.name}`);
    await channel.setName(pendingName, reason);
    await sleep(5000);
    await channel.delete(reason);
    deletedChannels.push(item.channelName);
  } catch (error) {
    console.error(`刪除 ${item.channelName} 失敗：`, error);
    failedOperations.push(`刪除失敗：${item.channelName}`);
  }
}

async function executeDeepCleanup(interaction, plan) {
  const guild = interaction.guild;
  const createdCategories = [];
  const movedChannels = [];
  const archivedChannels = [];
  const deletedChannels = [];
  const failedOperations = [];
  const categoriesByName = new Map(
    [...guild.channels.cache.values()]
      .filter((channel) => channel.type === ChannelType.GuildCategory)
      .map((category) => [category.name, category])
  );

  for (const categoryName of plan.categoriesToCreate) {
    const category = await getOrCreateCategory(guild, categoryName, createdCategories, failedOperations);
    if (category) categoriesByName.set(category.name, category);
  }

  if (!categoriesByName.has(ARCHIVE_CATEGORY)) {
    const archive = await getOrCreateCategory(guild, ARCHIVE_CATEGORY, createdCategories, failedOperations);
    if (archive) categoriesByName.set(archive.name, archive);
  }

  for (const item of plan.moves.slice(0, MAX_MOVE_COUNT)) {
    if (item.channelId === plan.sourceChannelId) continue;
    await moveChannel(
      guild,
      item,
      categoriesByName,
      movedChannels,
      failedOperations,
      `Deep cleanup confirmed by ${interaction.user.tag}`
    );
  }

  for (const item of plan.archives.slice(0, MAX_MOVE_COUNT)) {
    if (item.channelId === plan.sourceChannelId) continue;
    await moveChannel(
      guild,
      item,
      categoriesByName,
      archivedChannels,
      failedOperations,
      `Deep cleanup archive confirmed by ${interaction.user.tag}`
    );
  }

  if (plan.deleteLevel !== 'safe') {
    for (const item of plan.deleteSuggestions.slice(0, MAX_DELETE_COUNT)) {
      if (item.channelId === plan.sourceChannelId) continue;
      await deleteChannelSafely(
        guild,
        item,
        deletedChannels,
        failedOperations,
        `Deep cleanup delete confirmed by ${interaction.user.tag}`
      );
    }
  }

  const logChannel = await getOrCreateLogChannel(guild, categoriesByName, createdCategories, failedOperations);
  const summary = {
    createdCategories,
    movedChannels,
    archivedChannels,
    deletedChannels,
    failedOperations,
    categoryCleanup: { renamed: [], deleted: [], skipped: [], failed: [] }
  };

  try {
    summary.categoryCleanup = await cleanupEmptyCategories(guild, {
      deleteLevel: plan.deleteLevel
    });
  } catch (error) {
    console.error('深度整理後清理空分類失敗：', error);
    failedOperations.push('清理空分類失敗');
  }

  if (logChannel) {
    try {
      const embed = new EmbedBuilder()
        .setColor(0x2f80ed)
        .setTitle('深度整理完成紀錄')
        .setDescription(`執行者：${interaction.user}\ndelete_level：${plan.deleteLevel}`)
        .addFields(
          { name: '建立分類', value: createdCategories.join('、') || '無' },
          { name: '搬移頻道', value: movedChannels.slice(0, 10).join('\n') || '無' },
          { name: '封存頻道', value: archivedChannels.slice(0, 10).join('\n') || '無' },
          { name: '刪除頻道', value: deletedChannels.join('、') || '無' },
          {
            name: '空分類清理',
            value: [
              `封存/改名：${summary.categoryCleanup.renamed.length}`,
              `刪除：${summary.categoryCleanup.deleted.length}`
            ].join('\n')
          },
          { name: '失敗', value: failedOperations.slice(0, 10).join('\n') || '無' }
        )
        .setTimestamp();
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('發送深度整理紀錄失敗：', error);
    }
  }

  return summary;
}

module.exports = {
  executeDeepCleanup
};
