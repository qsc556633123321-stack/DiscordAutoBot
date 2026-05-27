const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { COMMUNITY_LAYOUT, PUBLIC_ONBOARDING_CHANNELS, REQUIRED_ROLES } = require('../config/communityLayout');
const permissionTemplates = require('../config/permissionTemplates');
const { registerCreateEntryChannel } = require('./gameChannels');
const { isTempVoice } = require('./tempVoice');
const { setupCommunityGuide } = require('./communityConcierge');
const { writeServerLog } = require('./serverLogs');

const STEP_DELAY_MS = 700;

function wait(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeName(name = '') {
  return String(name).normalize('NFKC').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function findCategory(guild, name) {
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name) || null;
}

function findChannel(guild, spec) {
  return guild.channels.cache.find((channel) => (
    channel.type === spec.type &&
    normalizeName(channel.name) === normalizeName(spec.name)
  )) || null;
}

function getTemplateOverwrites(guild, layoutItem) {
  if (layoutItem.permission === 'publicEntry') return permissionTemplates.publicEntry(guild);
  if (layoutItem.permission === 'semiPublic') return permissionTemplates.semiPublic(guild);
  if (layoutItem.permission === 'roleRestricted') return permissionTemplates.roleRestricted(guild, layoutItem.roleName);
  if (layoutItem.permission === 'nightCrew') return permissionTemplates.nightCrew(guild);
  if (layoutItem.permission === 'adminOnly') return permissionTemplates.adminOnly(guild);
  return permissionTemplates.publicEntry(guild);
}

function isProtectedChannel(channel) {
  if (!channel) return true;
  if (channel.name.startsWith('ticket-')) return true;
  if (channel.guild && isTempVoice(channel.guild.id, channel.id)) return true;
  if (/server-logs|ticket-logs/i.test(channel.name)) return true;
  return false;
}

async function ensureRoles(guild, summary) {
  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    summary.warnings.push('Bot 缺少 ManageRoles，略過 role 建立。');
    return;
  }

  for (const roleConfig of REQUIRED_ROLES) {
    let role = guild.roles.cache.find((item) => item.name === roleConfig.name);
    if (!role) {
      try {
        role = await guild.roles.create({
          name: roleConfig.name,
          color: roleConfig.color,
          permissions: [],
          mentionable: false,
          reason: 'Community bootstrap role setup'
        });
        summary.createdRoles.push(role.name);
        await wait();
      } catch (error) {
        summary.failed.push(`role ${roleConfig.name}: ${error.message}`);
      }
    } else {
      summary.existingRoles.push(role.name);
    }
  }
}

async function ensureCategory(guild, layoutItem, summary) {
  let category = findCategory(guild, layoutItem.name);
  const overwrites = getTemplateOverwrites(guild, layoutItem);
  if (!category) {
    category = await guild.channels.create({
      name: layoutItem.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: overwrites,
      reason: 'Community bootstrap category setup'
    });
    summary.createdCategories.push(category.name);
    await wait();
  } else {
    summary.existingCategories.push(category.name);
    await category.permissionOverwrites.set(overwrites, 'Community permission repair').catch((error) => {
      summary.failed.push(`${category.name} permissions: ${error.message}`);
    });
  }
  return category;
}

async function ensureChannels(guild, layoutItem, category, summary, options = {}) {
  for (let index = 0; index < layoutItem.channels.length; index += 1) {
    const spec = layoutItem.channels[index];
    let channel = findChannel(guild, spec);
    if (!channel) {
      try {
        channel = await guild.channels.create({
          name: spec.name,
          type: spec.type,
          parent: category.id,
          userLimit: spec.userLimit,
          reason: 'Community bootstrap channel setup'
        });
        summary.createdChannels.push(channel.name);
        await wait();
      } catch (error) {
        summary.failed.push(`channel ${spec.name}: ${error.message}`);
        continue;
      }
    } else {
      summary.existingChannels.push(channel.name);
      if (channel.parentId !== category.id && !isProtectedChannel(channel)) {
        await channel.setParent(category.id, { lockPermissions: false, reason: 'Community layout repair placement' }).catch((error) => {
          summary.failed.push(`${channel.name} move: ${error.message}`);
        });
        await wait();
      }
    }

    if (!isProtectedChannel(channel)) {
      await channel.lockPermissions().catch((error) => summary.warnings.push(`${channel.name} lockPermissions: ${error.message}`));
    }
    if (spec.createEntryGame) registerCreateEntryChannel(guild, channel, spec.createEntryGame);
    if (options.order) {
      await channel.setPosition(index, { reason: 'Community layout channel ordering' }).catch(() => null);
    }
  }
}

function createSummary() {
  return {
    createdRoles: [],
    existingRoles: [],
    createdCategories: [],
    existingCategories: [],
    createdChannels: [],
    existingChannels: [],
    repairedCategories: [],
    repairedChannels: [],
    warnings: [],
    failed: []
  };
}

async function bootstrapCommunity(guild, options = {}) {
  const summary = createSummary();
  await ensureRoles(guild, summary);
  for (let index = 0; index < COMMUNITY_LAYOUT.length; index += 1) {
    const layoutItem = COMMUNITY_LAYOUT[index];
    const category = await ensureCategory(guild, layoutItem, summary);
    await ensureChannels(guild, layoutItem, category, summary, { order: true });
    if (options.order) await category.setPosition(index, { reason: 'Community layout category ordering' }).catch(() => null);
  }

  try {
    await setupCommunityGuide(guild, { mode: 'refresh' });
  } catch (error) {
    summary.warnings.push(`community guide setup: ${error.message}`);
  }

  await writeServerLog(guild, {
    title: '🏗 Community Bootstrap 已執行',
    description: `建立 ${summary.createdChannels.length} 個頻道，修復標準社群權限。`,
    color: summary.failed.length ? 0xf2c94c : 0x57f287
  }).catch(() => null);

  return summary;
}

async function repairChannelPermissions(guild) {
  const summary = createSummary();
  for (const layoutItem of COMMUNITY_LAYOUT) {
    const category = findCategory(guild, layoutItem.name);
    if (!category) {
      summary.warnings.push(`缺少分類：${layoutItem.name}`);
      continue;
    }
    const overwrites = getTemplateOverwrites(guild, layoutItem);
    await category.permissionOverwrites.set(overwrites, 'Community permission repair').then(() => {
      summary.repairedCategories.push(category.name);
    }).catch((error) => summary.failed.push(`${category.name}: ${error.message}`));

    for (const spec of layoutItem.channels) {
      const channel = findChannel(guild, spec);
      if (!channel) {
        summary.warnings.push(`缺少頻道：${spec.name}`);
        continue;
      }
      if (isProtectedChannel(channel)) {
        summary.warnings.push(`保護略過：${channel.name}`);
        continue;
      }
      if (channel.parentId !== category.id) {
        await channel.setParent(category.id, { lockPermissions: false, reason: 'Community permission repair placement' }).catch((error) => {
          summary.failed.push(`${channel.name} move: ${error.message}`);
        });
      }
      await channel.lockPermissions().then(() => {
        summary.repairedChannels.push(channel.name);
      }).catch((error) => summary.failed.push(`${channel.name}: ${error.message}`));
      if (spec.createEntryGame) registerCreateEntryChannel(guild, channel, spec.createEntryGame);
      await wait();
    }
  }
  await writeServerLog(guild, {
    title: '🧰 Community 權限修復完成',
    description: `分類 ${summary.repairedCategories.length}，頻道 ${summary.repairedChannels.length}`,
    color: summary.failed.length ? 0xf2c94c : 0x57f287
  }).catch(() => null);
  return summary;
}

async function rebuildCommunityLayout(guild) {
  const summary = await bootstrapCommunity(guild, { order: true });
  summary.layoutRebuilt = true;
  return summary;
}

function checkEveryoneCanView(channel) {
  const overwrite = channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id);
  if (overwrite?.deny?.has(PermissionFlagsBits.ViewChannel)) return false;
  if (overwrite?.allow?.has(PermissionFlagsBits.ViewChannel)) return true;
  if (channel.parent) return checkEveryoneCanView(channel.parent);
  return channel.permissionsFor(channel.guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
}

function checkOnboardingVisibility(guild) {
  const results = [];
  const required = new Set(PUBLIC_ONBOARDING_CHANNELS);
  for (const layoutItem of COMMUNITY_LAYOUT) {
    for (const spec of layoutItem.channels) {
      const channel = findChannel(guild, spec);
      const shouldBeVisible = required.has(spec.name) || spec.onboardingVisible || layoutItem.onboardingVisible;
      if (!channel) {
        results.push({
          channelName: spec.name,
          ok: false,
          shouldBeVisible,
          reason: '頻道不存在'
        });
        continue;
      }
      const visible = checkEveryoneCanView(channel);
      results.push({
        channelName: channel.name,
        ok: shouldBeVisible ? visible : !visible,
        shouldBeVisible,
        reason: shouldBeVisible
          ? (visible ? 'onboarding 可見' : '@everyone 無 View Channel')
          : (visible ? '角色限制頻道外漏給 @everyone' : '已正確限制')
      });
    }
  }
  return results;
}

function buildSummaryEmbed(title, summary) {
  return new EmbedBuilder()
    .setColor(summary.failed?.length ? 0xf2c94c : 0x57f287)
    .setTitle(title)
    .addFields(
      { name: '建立角色', value: summary.createdRoles?.join('\n') || '無', inline: true },
      { name: '建立分類', value: summary.createdCategories?.join('\n') || '無', inline: true },
      { name: '建立頻道', value: summary.createdChannels?.slice(0, 15).join('\n') || '無', inline: false },
      { name: '修復分類', value: summary.repairedCategories?.slice(0, 15).join('\n') || '無', inline: true },
      { name: '修復頻道', value: summary.repairedChannels?.slice(0, 15).join('\n') || '無', inline: true },
      { name: '提醒', value: summary.warnings?.slice(0, 10).join('\n') || '無', inline: false },
      { name: '失敗', value: summary.failed?.slice(0, 10).join('\n') || '無', inline: false }
    )
    .setTimestamp();
}

function buildOnboardingCheckEmbed(results) {
  const visible = results.filter((item) => item.shouldBeVisible);
  const restricted = results.filter((item) => !item.shouldBeVisible);
  const bad = results.filter((item) => !item.ok);
  const line = (item) => `${item.ok ? '✅' : '❌'} ${item.channelName}\n原因：${item.reason}`;
  return new EmbedBuilder()
    .setColor(bad.length ? 0xf2c94c : 0x57f287)
    .setTitle('🧭 Onboarding Visibility Check')
    .setDescription('檢查 Discord 原生 onboarding 是否能看到入口頻道，以及受限頻道是否外漏。')
    .addFields(
      { name: '應公開入口', value: visible.slice(0, 12).map(line).join('\n\n').slice(0, 1024) || '無', inline: false },
      { name: '應角色限制', value: restricted.slice(0, 12).map(line).join('\n\n').slice(0, 1024) || '無', inline: false },
      { name: '需要修復', value: bad.slice(0, 10).map((item) => `- ${item.channelName}: ${item.reason}`).join('\n') || '無', inline: false }
    )
    .setTimestamp();
}

module.exports = {
  STEP_DELAY_MS,
  bootstrapCommunity,
  buildOnboardingCheckEmbed,
  buildSummaryEmbed,
  checkOnboardingVisibility,
  rebuildCommunityLayout,
  repairChannelPermissions
};
