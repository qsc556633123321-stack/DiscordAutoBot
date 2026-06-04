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
const {
  findGameCategory,
  registerCreateEntryChannel,
  setupGameChannels,
  upsertDynamicGameMetadata
} = require('./gameChannels');
const { writeServerLog } = require('./serverLogs');
const { scheduleVoiceHubUpdate } = require('./voiceHub');
const { setupChannelPanels } = require('./channelPanels');
const { resolveGameIdentity } = require('./gameIdentityService');
const { systemEmbed, managerEmbed } = require('./personaMessageSystem');

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
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
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

function makeVoiceLabel(gameName) {
  return String(gameName || '').replace(/[^\p{Letter}\p{Number}]+/gu, '').slice(0, 18) || '遊戲';
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

function listPendingSuggestions(guildId, limit = 10) {
  const suggestions = Object.values(readSuggestions()[guildId] || {})
    .filter((item) => item.status === 'pending')
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, limit);
  if (!suggestions.length) return '目前沒有等待審核的遊戲提議。';
  return suggestions
    .map((item) => {
      const support = item.supporters?.length || 0;
      const oppose = item.opposers?.length || 0;
      return `- ${item.gameName}：👍 ${support} / 👎 ${oppose}`;
    })
    .join('\n');
}

function buildSuggestionEmbed(suggestion) {
  const statusText = {
    pending: '等待投票與管理員審核',
    approved: '✅ 已批准',
    rejected: '❌ 已拒絕'
  }[suggestion.status || 'pending'];

  const embed = new EmbedBuilder()
    .setColor(suggestion.status === 'rejected' ? 0xeb5757 : suggestion.status === 'approved' ? 0x57f287 : 0x5865f2)
    .setTitle('🎮 遊戲分類提議')
    .addFields(
      { name: '遊戲', value: suggestion.gameName || '未命名', inline: true },
      { name: '提議者', value: `<@${suggestion.requestedById}>`, inline: true },
      { name: '狀態', value: statusText, inline: false },
      { name: '理由', value: suggestion.reason || '未填寫', inline: false }
    )
    .setTimestamp(new Date(suggestion.createdAt || Date.now()));

  if (suggestion.rejectReason) {
    embed.addFields({ name: '拒絕理由', value: suggestion.rejectReason, inline: false });
  }
  if (suggestion.note) {
    embed.addFields({ name: '系統備註', value: suggestion.note, inline: false });
  }
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
          content: '你是 Discord 社群管家。請用自然、簡短、繁體中文寫一句社群感提示，不要像客服機器人。'
        },
        { role: 'user', content: JSON.stringify({ kind, context }) }
      ],
      temperature: 0.8,
      max_tokens: 80
    });
    return response.choices?.[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function buildSuggestionRows(suggestionId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`game_suggest_support_${suggestionId}`).setLabel('支持').setEmoji('👍').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`game_suggest_oppose_${suggestionId}`).setLabel('反對').setEmoji('👎').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`game_suggest_approve_${suggestionId}`).setLabel('批准').setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`game_suggest_reject_${suggestionId}`).setLabel('拒絕').setEmoji('❌').setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

async function createGameSuggestion(interaction, gameName, reason, requestedContent = '') {
  const channel = await getOrCreateGameSuggestionChannel(interaction.guild);
  const suggestionId = makeSuggestionId();
  const suggestion = {
    id: suggestionId,
    guildId: interaction.guild.id,
    gameName: String(gameName || '').trim().slice(0, 80),
    reason: String(reason || '').trim().slice(0, 500),
    requestedContent: String(requestedContent || '').trim().slice(0, 300),
    requestedById: interaction.user.id,
    status: 'pending',
    supporters: [],
    opposers: [],
    createdAt: new Date().toISOString(),
    messageId: null,
    channelId: channel.id
  };

  const message = await channel.send({
    content: await generateCommunityText('game_suggestion', { gameName, reason }, '新的遊戲分類提議出現了，大家可以投票看看社群需求。'),
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
    await interaction.reply({ content: '這個提議已結束或不存在。', ephemeral: true });
    return;
  }
  suggestion.supporters = (suggestion.supporters || []).filter((id) => id !== interaction.user.id);
  suggestion.opposers = (suggestion.opposers || []).filter((id) => id !== interaction.user.id);
  if (vote === 'support') suggestion.supporters.push(interaction.user.id);
  if (vote === 'oppose') suggestion.opposers.push(interaction.user.id);
  saveSuggestion(interaction.guild.id, suggestionId, suggestion);
  await updateSuggestionMessage(interaction.guild, suggestion);
  await interaction.reply({ content: vote === 'support' ? '已記錄你的支持。' : '已記錄你的反對。', ephemeral: true });
}

function buildGameChannelSpecs(gameName) {
  return [
    { key: 'chat', name: '💬｜聊天', type: ChannelType.GuildText },
    { key: 'lfg', name: '🧑‍🤝‍🧑｜找隊友', type: ChannelType.GuildText },
    { key: 'info', name: '📌｜資訊', type: ChannelType.GuildText },
    { key: 'voiceCreate', name: '🔊｜➕｜建立語音', type: ChannelType.GuildVoice, createEntry: true, userLimit: 1 }
  ];
}

function buildGameCategoryOverwrites(guild) {
  const gameRole = guild.roles.cache.find((role) => role.name === '🎮 遊戲玩家');
  const adminRoles = guild.roles.cache.filter((role) => ['站長', '管理員', '👑 站長', '🛡 管理員', '🔧 MOD'].includes(role.name));
  const botId = guild.members.me?.id;
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
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
  if (botId) {
    overwrites.push({
      id: botId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.ManageChannels
      ]
    });
  }
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
  const identity = resolveGameIdentity(gameName);
  const displayName = identity.displayName;
  const categoryName = `🎮｜${displayName}`;
  const summary = { categoryName, displayName, gameId: identity.gameId || identity.id, slug: identity.slug, created: [], existing: [], moved: [], failed: [], alreadyExists: false };
  let category = findGameCategory(guild, displayName) ||
    guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && normalizeName(channel.name) === normalizeName(categoryName));
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
    summary.alreadyExists = true;
    summary.existing.push(category.name);
    await category.permissionOverwrites.set(buildGameCategoryOverwrites(guild), 'Dynamic game category permissions').catch((error) => {
      summary.failed.push(`${category.name} permissions: ${error.message}`);
    });
  }

  const specs = buildGameChannelSpecs(displayName);
  const channelMap = {};
  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index];
    const existing = guild.channels.cache.find((channel) => (
      channel.type === spec.type &&
      channel.parentId === category.id &&
      normalizeName(channel.name) === normalizeName(spec.name)
    ));
    if (existing) {
      if (existing.name !== spec.name) await existing.setName(spec.name, 'Dynamic game channel canonical name').catch(() => null);
      if (existing.parentId !== category.id) {
        await existing.setParent(category.id, { lockPermissions: false, reason: 'Dynamic game category placement' }).catch((error) => summary.failed.push(`${existing.name}: ${error.message}`));
        summary.moved.push(existing.name);
      } else {
        summary.existing.push(existing.name);
      }
      await existing.lockPermissions().catch(() => null);
      await existing.setPosition(index).catch(() => null);
      if (spec.createEntry) registerCreateEntryChannel(guild, existing, displayName);
      channelMap[spec.key] = existing;
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
      await channel.setPosition(index).catch(() => null);
      if (spec.createEntry) registerCreateEntryChannel(guild, channel, displayName);
      channelMap[spec.key] = channel;
      summary.created.push(channel.name);
      await sleep(STEP_DELAY_MS);
    } catch (error) {
      summary.failed.push(`${spec.name}: ${error.message}`);
    }
  }

  upsertDynamicGameMetadata(guild, category, { displayName, slug: identity.slug, gameId: identity.gameId || identity.id }, channelMap, requestedById);
  try {
    scheduleVoiceHubUpdate(guild, { delayMs: 1000 });
  } catch {
    // Voice Hub sync is best-effort; game creation should not fail because of it.
  }
  return summary;
}

async function getLatestTextActivity(channel) {
  if (channel.type !== ChannelType.GuildText) return 0;
  if (channel.lastMessage?.createdTimestamp) return channel.lastMessage.createdTimestamp;
  if (!channel.lastMessageId) return 0;
  try {
    const messages = await channel.messages.fetch({ limit: 1 });
    return messages.first()?.createdTimestamp || 0;
  } catch {
    return Date.now();
  }
}

async function approveSuggestion(interaction, suggestionId) {
  const suggestion = getSuggestion(interaction.guild.id, suggestionId);
  if (!suggestion || suggestion.status !== 'pending') {
    await interaction.reply({ content: '這個提議已結束或不存在。', ephemeral: true });
    return;
  }
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能批准遊戲提議。', ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  const existingCategory = findGameCategory(interaction.guild, suggestion.gameName);
  if (existingCategory) {
    const identity = resolveGameIdentity(suggestion.gameName);
    suggestion.status = 'approved';
    suggestion.approvedById = interaction.user.id;
    suggestion.approvedAt = new Date().toISOString();
    suggestion.existingCategoryId = existingCategory.id;
    suggestion.note = '已存在相同遊戲分類，不重複建立';
    saveSuggestion(interaction.guild.id, suggestionId, suggestion);
    await updateSuggestionMessage(interaction.guild, suggestion);
    await upsertDynamicGameMetadata(
      interaction.guild,
      existingCategory,
      {
        displayName: identity.displayName,
        slug: identity.slug,
        gameId: identity.gameId || identity.id
      },
      {},
      interaction.user.id
    );
    await interaction.editReply(`已存在相同遊戲分類：${existingCategory}，不重複建立。`);
    return;
  }
  const summary = await createDynamicGameCategory(interaction.guild, suggestion.gameName, interaction.user.id);
  suggestion.status = 'approved';
  suggestion.approvedById = interaction.user.id;
  suggestion.approvedAt = new Date().toISOString();
  saveSuggestion(interaction.guild.id, suggestionId, suggestion);
  await updateSuggestionMessage(interaction.guild, suggestion);
  await setupChannelPanels({
    client: interaction.client,
    guild: interaction.guild,
    currentChannel: null,
    mode: 'refresh',
    target: 'game'
  }).catch(() => null);
  await writeServerLog(interaction.guild, {
    title: '🎮 遊戲分類提議已批准',
    description: `${interaction.user} 批准：${suggestion.gameName}`,
    color: 0x57f287
  }).catch(() => null);
  await interaction.editReply({
    embeds: [
      systemEmbed({
        title: '🎮 新遊戲分類已建立',
        description: [
          `《${summary.displayName}》`,
          '',
          '已新增或確認：',
          '💬 聊天',
          '🧑‍🤝‍🧑 找隊友',
          '📌 資訊',
          '🔊 建立語音',
          '',
          `slug：${summary.slug}`
        ]
      })
    ],
    content: summary.failed.length ? `有 ${summary.failed.length} 個項目失敗：${summary.failed.join('、')}` : null
  });
  const suggestionChannel = interaction.guild.channels.cache.get(suggestion.channelId);
  if (suggestionChannel?.send) {
    await suggestionChannel.send({
      embeds: [
        managerEmbed({
          title: `《${summary.displayName}》遊戲區開好了`,
          description: [
            `最近好像不少人在玩《${summary.displayName}》👀`,
            '就先幫大家開一區了。',
            '',
            '想找人一起玩的可以直接進來揪～'
          ]
        })
      ]
    }).catch(() => null);
  }
}

async function showRejectModal(interaction, suggestionId) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能拒絕遊戲提議。', ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId(`game_suggest_reject_modal_${suggestionId}`)
    .setTitle('拒絕遊戲提議');
  const input = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('拒絕理由')
    .setPlaceholder('例如：目前需求不夠、先集中在既有遊戲區、之後再開')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(400);
  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function rejectSuggestion(interaction, suggestionId) {
  const suggestion = getSuggestion(interaction.guild.id, suggestionId);
  if (!suggestion || suggestion.status !== 'pending') {
    await interaction.reply({ content: '這個提議已結束或不存在。', ephemeral: true });
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
    title: '🎮 遊戲分類提議已拒絕',
    description: `${interaction.user} 拒絕：${suggestion.gameName}\n理由：${reason}`,
    color: 0xeb5757
  }).catch(() => null);
  await interaction.reply({ content: `已拒絕 ${suggestion.gameName}：${reason}`, ephemeral: true });
}

async function showGameSuggestionModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('game_suggest_create_modal')
    .setTitle('提議新遊戲分類');
  const gameName = new TextInputBuilder()
    .setCustomId('game_name')
    .setLabel('遊戲名稱')
    .setPlaceholder('例如：R.E.P.O、POE、魔物獵人')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(80);
  const reason = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('為什麼需要這個分類？')
    .setPlaceholder('例如：最近很多人在玩，希望有聊天、找隊友和語音入口')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(500);
  const requestedContent = new TextInputBuilder()
    .setCustomId('requested_content')
    .setLabel('你希望建立哪些內容？')
    .setValue('聊天、找隊友、資訊、建立語音')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(300);
  modal.addComponents(
    new ActionRowBuilder().addComponents(gameName),
    new ActionRowBuilder().addComponents(reason),
    new ActionRowBuilder().addComponents(requestedContent)
  );
  await interaction.showModal(modal);
}

async function handleCreateSuggestionModal(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const gameName = interaction.fields.getTextInputValue('game_name').trim();
  const reason = interaction.fields.getTextInputValue('reason').trim();
  const requestedContent = interaction.fields.getTextInputValue('requested_content')?.trim() || '聊天、找隊友、資訊、建立語音';
  if (gameName.length < 2) {
    await interaction.editReply('遊戲名稱太短，請至少輸入 2 個字。');
    return;
  }
  const { channel } = await createGameSuggestion(interaction, gameName, reason, requestedContent);
  await interaction.editReply(`已送出遊戲提議，請到 ${channel} 查看投票卡。`);
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
    if (Math.max(...activityTimes) > cutoff) {
      skipped.push(`${meta.gameName}: 近期仍有活動`);
      continue;
    }
    try {
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
  handleCreateSuggestionModal,
  handleGameSuggestionButton,
  listPendingSuggestions,
  rejectSuggestion,
  showGameSuggestionModal
};
