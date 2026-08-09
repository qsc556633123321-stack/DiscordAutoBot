const fs = require('node:fs');
const path = require('node:path');
const {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const permissionTemplates = require('../config/permissionTemplates');
const {
  fromLegacyPublicationRecord,
  mapLegacyWelcomeDeliveryRequest,
  buildCommunityWelcomeMessage,
  GuidePublicationMessageLookupStatus,
  GuidePublicationOperationType,
  createGuidePublicationMutationInput,
  buildGuidePublicationMutationPlan
} = require('../application/community');
const { createCommunityAboutModel } = require('../domain/community/communityAbout');
const { createCommunityRoadmapFeature } = require('../composition/communityRoadmapFeature');
const { createCommunityRoadmapEmbed } = require('../modules/community/communityRoadmapEmbed');
const { createCommunityGuideReadCompatibilityAdapter } = require('../composition/community/createCommunityGuideReadFeature');
const { createCommunityPublicationStateFeature } = require('../composition/communityPublicationStateFeature');
const { createCommunityRoadmapPersistenceFeature } = require('../composition/communityRoadmapPersistenceFeature');
const { createCommunityGuidePersistenceFeature } = require('../composition/communityGuidePersistenceFeature');
const { createCommunityGuideAdapterPairFeature } = require('../composition/communityGuideAdapterPairFeature');
const { createCommunityRoadmapAdapterPairFeature } = require('../composition/communityRoadmapAdapterPairFeature');
const { createRoadmapPublicationPersistenceRequest } = require('../application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');
const { createGuidePersistenceRequest } = require('../application/community/guidePublication/GuidePersistenceRequest');
const {
  RoadmapPublicationMessageLookupKind
} = require('../application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');

const communityGuideAdapterPairFeature = createCommunityGuideAdapterPairFeature();
const communityRoadmapAdapterPairFeature = createCommunityRoadmapAdapterPairFeature();

const DATA_DIR = path.join(__dirname, '..', 'data');
const ONBOARDING_FILE = path.join(DATA_DIR, 'onboarding-flows.json');
const GUIDE_CHANNEL_NAME = '🧭｜伺服器導覽';
const ROADMAP_CHANNEL_NAME = '🚧｜社群開發日誌';
const NATIVE_ONBOARDING_RECOMMENDATIONS = [
  '👋｜新人報到',
  '✅｜身分組領取',
  '🧭｜伺服器導覽',
  '📜｜社群規則'
];

function throwMutationFailure(getRetainedMutationFailure, operation, result) {
  const handoff = getRetainedMutationFailure();
  if (handoff.hasFailure) throw handoff.failure;
  throw new Error(`Guide ${operation} mutation failed: ${result.kind}/${result.failureKind || 'Unknown'}`);
}

function ensureFile(filePath, fallback = '{}') {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback, 'utf8');
}

function readJson(filePath, fallback = {}) {
  ensureFile(filePath, JSON.stringify(fallback, null, 2));
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Read ${path.basename(filePath)} failed:`, error);
    return fallback;
  }
}

function readOnboardingData() {
  return readJson(ONBOARDING_FILE, {});
}

function saveOnboarding(guildId, patch) {
  const feature = createCommunityPublicationStateFeature({
    filePath: ONBOARDING_FILE,
    dataDirectory: DATA_DIR
  });
  return feature.persistCommunityPublicationRecord.execute({ guildId, patch }).record;
}

async function generateConciergeText(kind, context, fallback) {
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是 Discord 社群管家。使用繁體中文，像真人社群朋友，溫暖、自然、短句，不要客服機器人感。最多 60 字。'
        },
        { role: 'user', content: JSON.stringify({ kind, context }) }
      ],
      temperature: 0.85,
      max_tokens: 120
    });
    return response.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (error) {
    return fallback;
  }
}

function findChannelByName(guild, name, type = ChannelType.GuildText) {
  return guild.channels.cache.find((channel) => channel.type === type && channel.name === name) || null;
}

async function getOrCreateCategory(guild, name) {
  let category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);
  if (!category) {
    category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory,
      reason: 'Community concierge setup'
    });
  }
  return category;
}

async function getOrCreateGuideChannel(guild) {
  const category = await getOrCreateCategory(guild, '📌｜社群入口');
  let channel = findChannelByName(guild, GUIDE_CHANNEL_NAME);
  if (!channel) {
    channel = await guild.channels.create({
      name: GUIDE_CHANNEL_NAME,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: permissionTemplates.onboardingVisible(guild),
      reason: 'Community guide setup'
    });
  } else if (channel.parentId !== category.id) {
    await channel.setParent(category.id, { lockPermissions: false, reason: 'Move guide channel to entry category' });
  }
  await channel.permissionOverwrites.set(permissionTemplates.onboardingVisible(guild), 'Keep guide channel onboarding visible').catch(() => null);
  return channel;
}

async function getOrCreateRoadmapChannel(guild) {
  const category = await getOrCreateCategory(guild, '🎮｜遊戲中心');
  let channel = findChannelByName(guild, ROADMAP_CHANNEL_NAME);
  if (!channel) {
    channel = await guild.channels.create({
      name: ROADMAP_CHANNEL_NAME,
      type: ChannelType.GuildText,
      parent: category.id,
      reason: 'Community roadmap setup'
    });
  }
  return channel;
}

async function buildGuidePayload(guild) {
  return createCommunityGuideReadCompatibilityAdapter({
    guild,
    conciergeTextGenerator: { generate: generateConciergeText }
  }).buildPayload();
}

function listChannelsByPatterns(guild, patterns) {
  return guild.channels.cache
    .filter((channel) => channel.type === ChannelType.GuildText && patterns.some((pattern) => pattern.test(channel.name)))
    .map((channel) => `${channel}`)
    .slice(0, 8);
}

function buildRoadmapEmbed() {
  const result = createCommunityRoadmapFeature().getCommunityRoadmap.execute();
  if (!result.ok) throw new Error(result.error.message);
  return createCommunityRoadmapEmbed(result.data.roadmap);
}

function buildAboutEmbed(guild) {
  return new EmbedBuilder(createCommunityAboutModel({ guildName: guild.name }).embed)
    .setTimestamp();
}

async function setupCommunityGuide(guild, options = {}) {
  const channel = await getOrCreateGuideChannel(guild);
  const { lookupPort, mutationPort, getRetainedMessage, getRetainedMutationFailure } =
    communityGuideAdapterPairFeature.createAdapterPair({ ensuredChannel: channel });
  const payload = await buildGuidePayload(guild);
  const data = readOnboardingData()[guild.id] || {};
  const publicationState = fromLegacyPublicationRecord(guild.id, data);
  // Preserve the legacy truthy malformed-ID fetch behavior until identity validation is approved.
  const guideMessageId = publicationState.guide.messageId || data.guideMessageId;
  let message = null;
  if (guideMessageId && options.mode !== 'force') {
    const lookupResult = await lookupPort.lookup({
      guildId: guild.id,
      channelId: channel.id,
      messageId: guideMessageId
    });
    if (lookupResult.status === GuidePublicationMessageLookupStatus.MessageAvailable) {
      message = getRetainedMessage();
    }
  }
  const mutationInput = createGuidePublicationMutationInput({
    guildId: guild.id,
    mode: options.mode,
    trackedMessageId: guideMessageId,
    existingMessageAvailable: Boolean(message),
    existingMessageLookupAttempted: Boolean(guideMessageId) && options.mode !== 'force'
  });
  const mutationPlan = buildGuidePublicationMutationPlan(mutationInput);
  if (mutationPlan.operation === GuidePublicationOperationType.EditExistingMessage) {
    const result = await mutationPort.edit({
      guildId: guild.id,
      channelId: channel.id,
      messageId: message.id,
      payload
    });
    if (result.kind !== 'EditSuccess') throwMutationFailure(getRetainedMutationFailure, 'edit', result);
    const retainedMessage = getRetainedMessage();
    if (retainedMessage !== message || !retainedMessage || retainedMessage.id !== result.messageId) {
      throw new Error('Guide edit mutation retained-message invariant failed');
    }
    message = retainedMessage;
  } else if (mutationPlan.operation === GuidePublicationOperationType.SendNewMessage) {
    const result = await mutationPort.send({ guildId: guild.id, channelId: channel.id, payload });
    if (result.kind !== 'SendSuccess') throwMutationFailure(getRetainedMutationFailure, 'send', result);
    const retainedMessage = getRetainedMessage();
    if (!retainedMessage || retainedMessage.id !== result.messageId) {
      throw new Error('Guide send mutation retained-message invariant failed');
    }
    message = retainedMessage;
  } else {
    throw new Error(`Unsupported Guide publication operation: ${mutationPlan.operation}`);
  }
  const communityPublicationStateFeature = createCommunityPublicationStateFeature({ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR });
  const communityGuidePersistenceFeature = createCommunityGuidePersistenceFeature({ communityPublicationStateFeature });
  const persistenceRequest = createGuidePersistenceRequest({ guildId: guild.id, channelId: channel.id, messageId: message.id, nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS, nativeTaskExcludedChannels: ['🎮｜目前語音房', '🎮｜遊戲中心'] });
  communityGuidePersistenceFeature.persist(persistenceRequest);
  return { channel, message };
}

async function setupRoadmapPanel(guild) {
  const channel = await getOrCreateRoadmapChannel(guild);
  const { lookupPort, mutationPort, getRetainedMessage } =
    communityRoadmapAdapterPairFeature.createAdapterPair({ ensuredChannel: channel });
  const data = readOnboardingData()[guild.id] || {};
  const publicationState = fromLegacyPublicationRecord(guild.id, data);
  // Preserve the legacy truthy malformed-ID fetch behavior until identity validation is approved.
  const roadmapMessageId = publicationState.roadmap.messageId || data.roadmapMessageId;
  const payload = { embeds: [buildRoadmapEmbed()] };
  let message = null;
  if (roadmapMessageId) {
    const lookupResult = await lookupPort.lookupTrackedMessage({ messageId: roadmapMessageId });
    if (lookupResult?.kind === RoadmapPublicationMessageLookupKind.Available) {
      const retainedMessage = getRetainedMessage();
      if (!retainedMessage) {
        throw new Error('Roadmap lookup returned Available without retained message');
      }
      message = retainedMessage;
    } else if (lookupResult?.kind !== RoadmapPublicationMessageLookupKind.Unavailable) {
      throw new Error('Roadmap lookup returned unexpected result');
    }
  }
  if (message) await mutationPort.edit({ messageId: message.id, payload });
  else { const sendResult = await mutationPort.send({ payload }); const retainedMessage = getRetainedMessage(); if (!retainedMessage || typeof retainedMessage.id !== 'string' || !retainedMessage.id || retainedMessage.id !== sendResult.messageId) throw new Error('Roadmap send mutation retained-message invariant failed'); message = retainedMessage; }
  const communityPublicationStateFeature = createCommunityPublicationStateFeature({ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR });
  const communityRoadmapPersistenceFeature = createCommunityRoadmapPersistenceFeature({ communityPublicationStateFeature });
  const persistenceRequest = createRoadmapPublicationPersistenceRequest({ guildId: guild.id, channelId: channel.id, messageId: message.id });
  communityRoadmapPersistenceFeature.persist(persistenceRequest);
  return { channel, message };
}

async function maybeAddRole(member, roleName) {
  if (!member?.guild?.members?.me?.permissions.has(PermissionFlagsBits.ManageRoles)) return false;
  const role = member.guild.roles.cache.find((item) => item.name === roleName);
  if (!role || !role.editable || member.guild.members.me.roles.highest.comparePositionTo(role) <= 0) return false;
  await member.roles.add(role, 'Community concierge quick role').catch(() => null);
  return true;
}

function quickLinks(guild, kind) {
  if (kind === 'games') return listChannelsByPatterns(guild, [/找隊友|組隊|目前語音|遊戲提議|聊天/i]);
  if (kind === 'invest') return listChannelsByPatterns(guild, [/台股|盤勢|股票|投資/i]);
  if (kind === 'dev') return listChannelsByPatterns(guild, [/程式|AI|開發|作品/i]);
  if (kind === 'night') return listChannelsByPatterns(guild, [/深夜|夜聊|目前語音|一般聊天/i]);
  return [];
}

async function handleConciergeButton(interaction) {
  const id = interaction.customId;
  const guild = interaction.guild;
  if (id === 'concierge_games') {
    const added = await maybeAddRole(interaction.member, '🎮 遊戲玩家');
    const links = quickLinks(guild, 'games');
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('🎮 遊戲入口')
          .setDescription('目前你可以先看組隊招募、目前語音房，或用 `/suggest-game` 提議新增遊戲分類。')
          .addFields(
            { name: '目前熱門方向', value: 'TFT、LOL、APEX、VALORANT', inline: false },
            { name: '推薦前往', value: links.join('\n') || '目前還沒有找到遊戲入口頻道。', inline: false },
            { name: '身分組', value: added ? '已幫你加入 🎮 遊戲玩家。' : '如果還看不到遊戲分類，請按「領取身分組」。', inline: false }
          )
      ],
      ephemeral: true
    });
    return true;
  }

  if (id === 'concierge_night') {
    const links = quickLinks(guild, 'night');
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle('🌙 深夜聊天室入口')
          .setDescription('如果你常在 00:00-05:00 語音出沒，累積到一定程度會解鎖 Night Crew。')
          .addFields(
            { name: '可以先去', value: links.join('\n') || '目前還沒有找到深夜入口。', inline: false },
            { name: '怎麼開始', value: '看看目前語音房，或自己開一間「深夜聊天」Temp Voice。', inline: false }
          )
      ],
      ephemeral: true
    });
    return true;
  }

  if (id === 'concierge_bot') {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('🤖 Community OS 功能')
          .setDescription(
            '- 🎧 Temp Voice：自動建立臨時語音\n' +
            '- 📢 LFG 招募：用招募卡加入語音\n' +
            '- 🌙 Night Crew：深夜語音文化\n' +
            '- 🤝 社交語音統計：熟人感與語音檔案\n' +
            '- 🧠 AI 社群氣氛：短文案與導覽\n' +
            '- 🎮 動態遊戲分類：玩家提議、管理員批准\n' +
            '- 🛡 Member Guard：新人安全防護\n' +
            '- 🔗 Link Guard：惡意連結防護'
          )
      ],
      ephemeral: true
    });
    return true;
  }

  if (id === 'concierge_invest' || id === 'concierge_dev') {
    const kind = id === 'concierge_invest' ? 'invest' : 'dev';
    const title = kind === 'invest' ? '📈 投資入口' : '🧑‍💻 AI / 開發入口';
    const roleName = kind === 'invest' ? '📈 股票投資' : '🛠 開發/AI';
    const added = await maybeAddRole(interaction.member, roleName);
    const links = quickLinks(guild, kind);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(kind === 'invest' ? 0x27ae60 : 0x9b59b6)
          .setTitle(title)
          .setDescription(added ? `已幫你加入 ${roleName}。` : `你可以先領取 ${roleName} 身分組解鎖相關分類。`)
          .addFields({ name: '推薦前往', value: links.join('\n') || '目前還沒有找到相關入口。', inline: false })
      ],
      ephemeral: true
    });
    return true;
  }

  if (id === 'concierge_roadmap') {
    await interaction.reply({ embeds: [buildRoadmapEmbed()], ephemeral: true });
    return true;
  }

  return false;
}

async function sendConciergeWelcome(member) {
  const data = readOnboardingData()[member.guild.id] || {};
  const guideChannel = data.guideChannelId
    ? member.guild.channels.cache.get(data.guideChannelId) || await member.guild.channels.fetch(data.guideChannelId).catch(() => null)
    : findChannelByName(member.guild, GUIDE_CHANNEL_NAME);
  if (!guideChannel) return;
  const request = mapLegacyWelcomeDeliveryRequest({
    guildId: member.guild.id,
    guideChannelId: guideChannel.id
  });
  const payload = buildCommunityWelcomeMessage(request, { guildName: member.guild.name });
  await member.send(payload).catch(() => null);
}

module.exports = {
  GUIDE_CHANNEL_NAME,
  NATIVE_ONBOARDING_RECOMMENDATIONS,
  ROADMAP_CHANNEL_NAME,
  buildGuidePayload,
  buildAboutEmbed,
  buildRoadmapEmbed,
  generateConciergeText,
  handleConciergeButton,
  sendConciergeWelcome,
  setupCommunityGuide,
  setupRoadmapPanel
};
