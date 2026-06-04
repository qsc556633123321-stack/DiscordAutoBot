const { ChannelType } = require('discord.js');
const {
  repairDynamicGameMetadataForCategory,
  registerCreateEntryChannel
} = require('./gameChannels');
const { writeServerLog } = require('./serverLogs');

const STEP_DELAY_MS = 800;

function sleep(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getOrCreateCategory(guild, name, summary) {
  let category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);
  if (category) return category;
  category = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    reason: 'Community Architect create category'
  });
  summary.created.push(name);
  await sleep();
  return category;
}

async function archiveDuplicateGameCategory(guild, item, summary) {
  const category = guild.channels.cache.get(item.targetId);
  if (!category || category.type !== ChannelType.GuildCategory) {
    summary.skipped.push(`${item.targetName}: 分類不存在`);
    return;
  }
  const archive = await getOrCreateCategory(guild, item.targetCategoryName || '📦｜遊戲封存區', summary);
  const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
  for (const child of children.values()) {
    await child.setParent(archive.id, { lockPermissions: false, reason: 'Community Architect archive duplicate game category' });
    summary.moved.push(`${child.name} -> ${archive.name}`);
    await sleep();
  }
  summary.archived.push(`${category.name} -> ${archive.name}`);
}

async function executeCommunityArchitectPlan(guild, plan) {
  const summary = {
    created: [],
    renamed: [],
    moved: [],
    permissions: [],
    metadata: [],
    archived: [],
    reordered: [],
    skipped: [],
    failed: []
  };

  await writeServerLog(guild, {
    title: '🏗️ Community Architect started',
    description: `plan: ${plan.planId}\nscope: ${plan.scope}\nstrategy: ${plan.strategy}\nactions: ${plan.actions.length}`,
    color: 0x5865f2
  }).catch(() => null);

  for (const item of plan.actions) {
    try {
      if (item.type === 'suggest') {
        summary.skipped.push(`${item.targetName}: ${item.reason}`);
        continue;
      }

      if (item.type === 'create_category') {
        await getOrCreateCategory(guild, item.targetName, summary);
        continue;
      }

      if (item.type === 'rename') {
        const channel = guild.channels.cache.get(item.targetId);
        if (!channel) {
          summary.skipped.push(`${item.targetName}: 頻道不存在`);
          continue;
        }
        if (channel.name !== item.newName) await channel.setName(item.newName, 'Community Architect rename');
        summary.renamed.push(`${item.targetName} -> ${item.newName}`);
        await sleep();
        continue;
      }

      if (item.type === 'move') {
        const channel = guild.channels.cache.get(item.targetId);
        const category = await getOrCreateCategory(guild, item.targetCategoryName, summary);
        if (!channel) {
          summary.skipped.push(`${item.targetName}: 頻道不存在`);
          continue;
        }
        await channel.setParent(category.id, { lockPermissions: false, reason: 'Community Architect move' });
        summary.moved.push(`${channel.name} -> ${category.name}`);
        await sleep();
        continue;
      }

      if (item.type === 'sync_permission') {
        const channel = guild.channels.cache.get(item.targetId);
        if (!channel?.parent) {
          summary.skipped.push(`${item.targetName}: 沒有分類可同步`);
          continue;
        }
        await channel.lockPermissions();
        summary.permissions.push(channel.name);
        await sleep();
        continue;
      }

      if (item.type === 'repair_metadata') {
        const category = guild.channels.cache.get(item.targetId || item.categoryId);
        if (!category) {
          summary.skipped.push(`${item.targetName}: 分類不存在`);
          continue;
        }
        const record = repairDynamicGameMetadataForCategory(guild, category, plan.createdBy);
        summary.metadata.push(`${category.name}: ${record?.gameId || record?.displayName || 'updated'}`);
        await sleep();
        continue;
      }

      if (item.type === 'repair_create_entry') {
        const channel = guild.channels.cache.get(item.targetId);
        if (!channel) {
          summary.skipped.push(`${item.targetName}: 頻道不存在`);
          continue;
        }
        registerCreateEntryChannel(guild, channel, item.displayName || item.gameId);
        summary.metadata.push(`${channel.name}: create entry`);
        await sleep();
        continue;
      }

      if (item.type === 'merge_duplicate_game' || item.type === 'archive') {
        await archiveDuplicateGameCategory(guild, item, summary);
        continue;
      }

      if (item.type === 'reorder_category') {
        const category = guild.channels.cache.get(item.targetId);
        const anchor = await getOrCreateCategory(guild, item.targetCategoryName, summary);
        if (!category) {
          summary.skipped.push(`${item.targetName}: 分類不存在`);
          continue;
        }
        await category.setPosition(anchor.rawPosition + 1, { reason: 'Community Architect reorder game tier' }).catch(() => null);
        summary.reordered.push(`${category.name} near ${anchor.name}`);
        await sleep();
      }
    } catch (error) {
      summary.failed.push(`${item.targetName || item.type}: ${error.message}`);
    }
  }

  await writeServerLog(guild, {
    title: '✅ Community Architect completed',
    description: [
      `created: ${summary.created.length}`,
      `renamed: ${summary.renamed.length}`,
      `moved: ${summary.moved.length}`,
      `permissions: ${summary.permissions.length}`,
      `archived: ${summary.archived.length}`,
      `failed: ${summary.failed.length}`
    ].join('\n'),
    color: 0x57f287
  }).catch(() => null);

  return summary;
}

module.exports = {
  executeCommunityArchitectPlan
};
