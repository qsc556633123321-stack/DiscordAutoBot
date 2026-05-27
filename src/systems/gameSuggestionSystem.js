const fs = require('node:fs');
const path = require('node:path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { getOrCreateGameArchiveCategory, getOrCreateGameSuggestionChannel } = require('./communityStructureManager');
const { registerCreateEntryChannel } = require('./gameChannels');
const { writeServerLog } = require('./serverLogs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SUGGESTION_FILE = path.join(DATA_DIR, 'game-suggestions.json');
const GAME_CATEGORY_FILE = path.join(DATA_DIR, 'game-categories.json');
const STEP_DELAY_MS = 700;
const ARCHIVE_AFTER_DAYS = 14;

function ensureFile(filePath) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}\n', 'utf8');
}

function readJson(filePath) {
  ensureFile(filePath);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`Read ${path.basename(filePath)} failed:`, error);
    return {};
  }
}

function writeJson(filePath, data) {
  ensureFile(filePath);
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error(`Write ${path.basename(filePath)} failed:`, error);
  }
}

function readSuggestions() {
  return readJson(SUGGESTION_FILE);
}

function writeSuggestions(data) {
  writeJson(SUGGESTION_FILE, data);
}

function readGameCategories() {
  return readJson(GAME_CATEGORY_FILE);
}

function writeGameCategories(data) {
  writeJson(GAME_CATEGORY_FILE, data);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function makeShortName(gameName) {
  const ascii = String(gameName || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 10);
  if (ascii) return ascii;
  return normalizeName(gameName).slice(0, 8) || 'game';
}

function makeVoiceLabel(gameName) {
  return String(gameName || '').replace(/[^\p{Letter}\p{Number}]+/gu, '').slice(0, 16) || '遊戲';
}

function makeSuggestionId() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function getSuggestion(guildId, suggestionId) {
  return readSuggestions()[guildId]?.[suggestionId] || null;
}

function saveSuggestion(guildId, suggestionId, suggestion) {
  const data = readSuggestions();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][suggestionId] = suggestion;
  writeSuggestions(data);
  return suggestion;
}

function buildSuggestionEmbed(suggestion) {
  const support = suggestion.supporters?.length || 0;
  const oppose = suggestion.opposers?.length || 0;
  const statusText = {
    pending: '審核中',
    approved: '✅ 已批准',
    rejected: '❌ 已拒絕'
  }[suggestion.status || 'pending'];

  const embed = new EmbedBuilder()
    .setColor(suggestion.status === 'rejected' ? 0xeb5757 : suggestion.status === 'approved' ? 0x57f287 : 0x5865f2)
    .setTitle('🎮 遊戲分類提議')
    .addFields(
      { name: '遊戲', value: suggestion.gameName, inline: true },
      { name: '提議者', value: `<@${suggestion.requestedById}>`, inline: true },
      { name: '狀態', value: statusText, inline: true },
      { name: '理由', value: suggestion.reason || '未提供', inline: false },
      { name: '👍 支持', value: String(support), inline: true },
      { name: '👎 反對', value: String(oppose), inline: true }
    )
    .setTimestamp(new Date(suggestion.createdAt || Date.now()));

  if (suggestion.rejectReason) embed.addFields({ name: '拒絕理由', value: suggestion.rejectReason, inline: false });
  return embed;
}

async function generateCommunityText(kind, context, fallback) {
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是 Discord 遊戲社群助手。使用繁體中文，語氣溫暖、有社群感，最多 40 字，不要提 RPG、抽卡、金幣。'
        },
        { role: 'user', content: JSON.stringify({ kind, context }) }
      ],
      temperature: 0.8,
      max_tokens: 80
    });
    return response.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (error) {
    return fallback;
  }
}

function buildSuggestionRows(suggestionId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`game_suggest_support_${suggestionId}`).setLabel('支持').setEmoji('👍').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`game_suggest_oppose_${suggestionId}`).setLabel('反對').setEmoji('👎').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`game_suggest_approve_${suggestionId}`).setLabel('管理員批准').setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`game_suggest_reject_${suggestionId}`).setLabel('管理員拒絕').setEmoji('❌').setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

async function createGameSuggestion(interaction, gameName, reason) {
  const channel = await getOrCreateGameSuggestionChannel(interaction.guild);
  const suggestionId = makeSuggestionId();
  const suggestion = {
    id: suggestionId,
    guildId: interaction.guild.id,
    gameName: String(gameName || '').trim().slice(0, 80),
    reason: String(reason || '').trim().slice(0, 500),
    requestedById: interaction.user.id,
    status: 'pending',
    supporters: [],
    opposers: [],
    createdAt: new Date().toISOString(),
    messageId: null,
    channelId: channel.id
  };

  const message = await channel.send({
    content: await generateCommunityText('game_suggestion', { gameName, reason }, '新的遊戲提議出現了，大家可以投票看看社群需求。'),
    embeds: [buildSuggestionEmbed(suggestion)],
    components: buildSuggestionRows(suggestionId)
  });
  suggestion.messageId = message.id;
  saveSuggestion(interaction.guild.id, suggestionId, suggestion);
  return { suggestion, channel, message };
}

async function updateSuggestionMessage(guild, suggestion) {
  const channel = guild.channels.cache.get(suggestion.channelId) || await guild.channels.fetch(suggestion.channelId).catch(() => null);
  if (!channel?.messages) return;
  const message = await channel.messages.fetch(suggestion.messageId).catch(() => null);
  if (!message) return;
  const done = suggestion.status !== 'pending';
  await message.edit({
    embeds: [buildSuggestionEmbed(suggestion)],
    components: buildSuggestionRows(suggestion.id, done)
  }).catch(() => null);
}

async function handleVote(interaction, suggestionId, vote) {
  const suggestion = getSuggestion(interaction.guild.id, suggestionId);
  if (!suggestion || suggestion.status !== 'pending') {
    await interaction.reply({ content: '這個遊戲提議已不存在或已結案。', ephemeral: true });
    return;
  }
  suggestion.supporters = (suggestion.supporters || []).filter((id) => id !== interaction.user.id);
  suggestion.opposers = (suggestion.opposers || []).filter((id) => id !== interaction.user.id);
  if (vote === 'support') suggestion.supporters.push(interaction.user.id);
  if (vote === 'oppose') suggestion.opposers.push(interaction.user.id);
  saveSuggestion(interaction.guild.id, suggestionId, suggestion);
  await updateSuggestionMessage(interaction.guild, suggestion);
  await interaction.reply({ content: vote === 'support' ? '已加入支持。' : '已加入反對。', ephemeral: true });
}

function buildGameChannelSpecs(gameName, shortName) {
  const voiceLabel = makeVoiceLabel(gameName);
  return [
    { name: `💬｜${shortName}-聊天`, type: ChannelType.GuildText },
    { name: `🧑‍🤝‍🧑｜${shortName}-找隊友`, type: ChannelType.GuildText },
    { name: `📌｜${shortName}-資訊`, type: ChannelType.GuildText },
    { name: `🔊｜➕｜建立${voiceLabel}語音`, type: ChannelType.GuildVoice, createEntry: true, userLimit: 1 }
  ];
}

function buildGameCategoryOverwrites(guild) {
  const gameRole = guild.roles.cache.find((role) => role.name === '🎮 遊戲玩家');
  const adminRoles = guild.roles.cache.filter((role) => ['站長', '管理員', '👑 站長', '🛡 管理員'].includes(role.name));
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.ManageChannels
      ]
    },
    ...adminRoles.map((role) => ({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect
      ]
    }))
  ];
  if (gameRole) {
    overwrites.push({
      id: gameRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect
      ]
    });
  }
  return overwrites;
}

async function createDynamicGameCategory(guild, gameName, requestedById) {
  const shortName = makeShortName(gameName);
  const categoryName = `🎮｜${gameName}`;
  const summary = { categoryName, shortName, created: [], existing: [], failed: [] };
  let category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName);
  if (!category) {
    category = await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory,
      permissionOverwrites: buildGameCategoryOverwrites(guild),
      reason: `Dynamic game category approved by ${requestedById}`
    });
    summary.created.push(category.name);
    await sleep(STEP_DELAY_MS);
  } else {
    summary.existing.push(category.name);
    await category.permissionOverwrites.set(buildGameCategoryOverwrites(guild), 'Dynamic game category permissions').catch((error) => {
      summary.failed.push(`${category.name} permissions: ${error.message}`);
    });
  }

  const specs = buildGameChannelSpecs(gameName, shortName);
  for (const spec of specs) {
    const existing = guild.channels.cache.find((channel) => channel.type === spec.type && normalizeName(channel.name) === normalizeName(spec.name));
    if (existing) {
      if (existing.parentId !== category.id) {
        await existing.setParent(category.id, { lockPermissions: false, reason: 'Dynamic game category placement' }).catch((error) => summary.failed.push(`${existing.name}: ${error.message}`));
      }
      await existing.lockPermissions().catch(() => null);
      if (spec.createEntry) registerCreateEntryChannel(guild, existing, gameName);
      summary.existing.push(existing.name);
      continue;
    }
    try {
      const channel = await guild.channels.create({
        name: spec.name,
        type: spec.type,
        parent: category.id,
        userLimit: spec.userLimit,
        reason: 'Dynamic game category channel setup'
      });
      await channel.lockPermissions().catch(() => null);
      if (spec.createEntry) registerCreateEntryChannel(guild, channel, gameName);
      summary.created.push(channel.name);
      await sleep(STEP_DELAY_MS);
    } catch (error) {
      summary.failed.push(`${spec.name}: ${error.message}`);
    }
  }

  const data = readGameCategories();
  if (!data[guild.id]) data[guild.id] = {};
  data[guild.id][category.id] = {
    gameName,
    shortName,
    categoryId: category.id,
    categoryName,
    createdBy: requestedById,
    createdAt: new Date().toISOString(),
    archived: false
  };
  writeGameCategories(data);
  return summary;
}

async function getLatestTextActivity(channel) {
  if (channel.type !== ChannelType.GuildText) return 0;
  if (channel.lastMessage?.createdTimestamp) return channel.lastMessage.createdTimestamp;
  if (!channel.lastMessageId) return 0;
  try {
    const messages = await channel.messages.fetch({ limit: 1 });
    return messages.first()?.createdTimestamp || 0;
  } catch (error) {
    return Date.now();
  }
}

async function approveSuggestion(interaction, suggestionId) {
  const suggestion = getSuggestion(interaction.guild.id, suggestionId);
  if (!suggestion || suggestion.status !== 'pending') {
    await interaction.reply({ content: '這個遊戲提議已不存在或已結案。', ephemeral: true });
    return;
  }
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '只有具備 ManageChannels 的管理員可以批准。', ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  const summary = await createDynamicGameCategory(interaction.guild, suggestion.gameName, interaction.user.id);
  suggestion.status = 'approved';
  suggestion.approvedById = interaction.user.id;
  suggestion.approvedAt = new Date().toISOString();
  saveSuggestion(interaction.guild.id, suggestionId, suggestion);
  await updateSuggestionMessage(interaction.guild, suggestion);
  await writeServerLog(interaction.guild, {
    title: '🎮 動態遊戲分類已批准',
    description: `${interaction.user} 批准了 ${suggestion.gameName}`,
    color: 0x57f287
  });
  await interaction.editReply(`已建立/同步遊戲分類：${summary.categoryName}\n建立：${summary.created.join('、') || '無'}\n已存在：${summary.existing.join('、') || '無'}\n失敗：${summary.failed.join('、') || '無'}`);
}

async function showRejectModal(interaction, suggestionId) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '只有具備 ManageChannels 的管理員可以拒絕。', ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId(`game_suggest_reject_modal_${suggestionId}`)
    .setTitle('拒絕遊戲提議');
  const input = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('拒絕理由')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(400);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function rejectSuggestion(interaction, suggestionId) {
  const suggestion = getSuggestion(interaction.guild.id, suggestionId);
  if (!suggestion || suggestion.status !== 'pending') {
    await interaction.reply({ content: '這個遊戲提議已不存在或已結案。', ephemeral: true });
    return;
  }
  const reason = interaction.fields.getTextInputValue('reason').slice(0, 400);
  suggestion.status = 'rejected';
  suggestion.rejectedById = interaction.user.id;
  suggestion.rejectedAt = new Date().toISOString();
  suggestion.rejectReason = reason;
  saveSuggestion(interaction.guild.id, suggestionId, suggestion);
  await updateSuggestionMessage(interaction.guild, suggestion);
  await writeServerLog(interaction.guild, {
    title: '🎮 動態遊戲分類已拒絕',
    description: `${interaction.user} 拒絕了 ${suggestion.gameName}\n理由：${reason}`,
    color: 0xeb5757
  });
  await interaction.reply({ content: `已拒絕 ${suggestion.gameName}：${reason}`, ephemeral: true });
}

async function handleGameSuggestionButton(interaction) {
  const id = interaction.customId;
  if (id.startsWith('game_suggest_support_')) return handleVote(interaction, id.replace('game_suggest_support_', ''), 'support');
  if (id.startsWith('game_suggest_oppose_')) return handleVote(interaction, id.replace('game_suggest_oppose_', ''), 'oppose');
  if (id.startsWith('game_suggest_approve_')) return approveSuggestion(interaction, id.replace('game_suggest_approve_', ''));
  if (id.startsWith('game_suggest_reject_')) return showRejectModal(interaction, id.replace('game_suggest_reject_', ''));
  return false;
}

function categoryHasActiveTempVoice(guild, categoryId) {
  return guild.channels.cache.some((channel) => channel.parentId === categoryId && channel.type === ChannelType.GuildVoice && channel.members.size > 0);
}

async function archiveInactiveGames(guild) {
  const data = readGameCategories();
  const guildGames = data[guild.id] || {};
  const archive = await getOrCreateGameArchiveCategory(guild);
  const cutoff = Date.now() - ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;
  const archived = [];
  const skipped = [];
  const failed = [];

  for (const [categoryId, meta] of Object.entries(guildGames)) {
    if (meta.archived) continue;
    const category = guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      skipped.push(`${meta.gameName}: 分類不存在`);
      continue;
    }
    if (categoryHasActiveTempVoice(guild, category.id)) {
      skipped.push(`${meta.gameName}: 有 active voice`);
      continue;
    }
    const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
    const activityTimes = [new Date(meta.createdAt || 0).getTime()];
    for (const channel of children.values()) {
      activityTimes.push(await getLatestTextActivity(channel));
    }
    const latestActivity = Math.max(...activityTimes);
    if (latestActivity > cutoff) {
      skipped.push(`${meta.gameName}: 近期仍可能活躍`);
      continue;
    }
    try {
      await category.setParent?.(archive.id).catch(() => null);
      for (const channel of children.values()) {
        await channel.setParent(archive.id, { lockPermissions: false, reason: 'Archive inactive dynamic game' });
        await sleep(STEP_DELAY_MS);
      }
      meta.archived = true;
      meta.archivedAt = new Date().toISOString();
      archived.push(meta.gameName);
    } catch (error) {
      failed.push(`${meta.gameName}: ${error.message}`);
    }
  }
  writeGameCategories(data);
  return { archived, skipped, failed };
}

module.exports = {
  archiveInactiveGames,
  createDynamicGameCategory,
  createGameSuggestion,
  generateCommunityText,
  handleGameSuggestionButton,
  rejectSuggestion
};
