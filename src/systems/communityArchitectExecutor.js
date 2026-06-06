const { ChannelType } = require('discord.js');
const {
  repairDynamicGameMetadataForCategory,
  registerCreateEntryChannel
} = require('./gameChannels');
const { writeServerLog } = require('./serverLogs');
const { buildVisibilityOverwrites } = require('../config/channelVisibilityRules');
const { ruleForChannel } = require('./guestGate');

const STEP_DELAY_MS = 800;
const MAIN_CATEGORY_ORDER = [
  '📌｜社群入口',
  '💬｜社群大廳',
  '🎮｜遊戲中心',
  '🎯｜熱門遊戲',
  '🧩｜其他遊戲',
  '🎨｜興趣交流',
  '🛠｜創作與開發',
  '📈｜投資討論',
  '🌙｜Night Crew',
  '🎫｜客服支援',
  '🔒｜管理員後台',
  '📦｜遊戲封存區',
  '📦｜舊頻道封存'
];

function sleep(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getOrCreateCategory(guild, name, summary) {
  let category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);
  if (category) return category;
  category = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: buildVisibilityOverwrites(guild, ruleForChannel({ type: ChannelType.GuildCategory, name }) || {
      visibilityType: 'formal_member_visible'
    }),
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
  await writeServerLog(guild, {
    title: '📦 Community Architect archived duplicate game',
    description: [
      `duplicate: ${category.name}`,
      `kept: ${item.keepCategoryName || 'unknown'}`,
      `archive: ${archive.name}`,
      `reason: ${item.reason}`
    ].join('\n'),
    color: 0xf2c94c
  }).catch(() => null);
}

async function sortMainCategories(guild, summary) {
  for (let index = 0; index < MAIN_CATEGORY_ORDER.length; index += 1) {
    const name = MAIN_CATEGORY_ORDER[index];
    const category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);
    if (!category) continue;
    await category.setPosition(index, { reason: 'Community Architect main category order' }).catch((error) => {
      summary.failed.push(`${name} sort: ${error.message}`);
    });
    await sleep(250);
  }
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

  let sortedMainBeforeReorder = false;
  let didReorder = false;

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

      if (item.type === 'restore_duplicate_game_name') {
        const category = guild.channels.cache.get(item.targetId);
        if (!category) {
          summary.skipped.push(`${item.targetName}: 分類不存在`);
          continue;
        }
        if (category.name !== item.newName) await category.setName(item.newName, 'Community Architect restore duplicate-game name');
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
        if (!channel) {
          summary.skipped.push(`${item.targetName}: 頻道不存在`);
          continue;
        }
        const guestGateRule = ruleForChannel(channel);
        if (guestGateRule) {
          await channel.permissionOverwrites.set(
            buildVisibilityOverwrites(guild, guestGateRule),
            'Community Architect Guest Gate permission sync'
          );
        } else if (channel.parent) {
          await channel.lockPermissions();
        } else {
          summary.skipped.push(`${item.targetName}: 沒有可套用的權限規則`);
          continue;
        }
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
        if (!sortedMainBeforeReorder) {
          await sortMainCategories(guild, summary);
          sortedMainBeforeReorder = true;
        }
        const category = guild.channels.cache.get(item.targetId);
        const anchor = await getOrCreateCategory(guild, item.targetCategoryName, summary);
        if (!category) {
          summary.skipped.push(`${item.targetName}: 分類不存在`);
          continue;
        }
        await category.setPosition(anchor.rawPosition + 1, { reason: 'Community Architect reorder game tier' }).catch(() => null);
        summary.reordered.push(`${category.name} near ${anchor.name}`);
        didReorder = true;
        await sleep();
      }
    } catch (error) {
      summary.failed.push(`${item.targetName || item.type}: ${error.message}`);
    }
  }

  if (!didReorder) await sortMainCategories(guild, summary);

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
