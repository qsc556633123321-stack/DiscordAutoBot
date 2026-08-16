const {
  ChannelType,
  EmbedBuilder
} = require('discord.js');
const permissionTemplates = require('../config/permissionTemplates');
const {
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
const { buildCommunityNonRoleConciergePresentationPayload } = require('../modules/community/CommunityNonRoleConciergePresentation');
const { buildCommunityRoleConciergePresentationPayload } = require('../modules/community/CommunityRoleConciergePresentation');
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
const { createCommunityPublicationTrackingReadRequest } = require('../application/community/ports/CommunityPublicationTrackingReadPort');
const { createCommunityPublicationTrackingReadCompatibilityAdapter } = require('../infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');
const { createCommunityPublicationChannelTrackingReadRequest } = require('../application/community/ports/CommunityPublicationChannelTrackingReadPort');
const { createCommunityPublicationChannelTrackingReadCompatibilityAdapter } = require('../infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const { createCommunityOnboardingStateReader } = require('../infrastructure/community/CommunityOnboardingStateReader');
const { createDefaultCommunityOnboardingJsonReader } = require('../infrastructure/community/CommunityOnboardingJsonReaderFactory');
const { createCommunityWelcomeChannelResolver } = require('../infrastructure/community/CommunityWelcomeChannelResolver');
const { createCommunityWelcomeDmDeliveryAdapter } = require('../infrastructure/community/CommunityWelcomeDmDeliveryAdapter');
const { createCommunityChannelSetupCompatibilityAdapter } = require('../infrastructure/community/CommunityChannelSetupCompatibilityAdapter');
const { createCommunityConciergeTextGenerationAdapter } = require('../infrastructure/community/CommunityConciergeTextGenerationAdapter');
const { createCommunityRoleQuickActionFeature } = require('../composition/communityRoleQuickActionFeature');
const { resolveCommunityConciergeButtonAction } = require('../application/community/CommunityConciergeButtonActionResolver');
const communityGuideAdapterPairFeature = createCommunityGuideAdapterPairFeature();
const communityRoadmapAdapterPairFeature = createCommunityRoadmapAdapterPairFeature();
const communityConciergeTextGenerationAdapter = createCommunityConciergeTextGenerationAdapter();
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
async function generateConciergeText(kind, context, fallback) {
  const request = {
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
  };
  return communityConciergeTextGenerationAdapter.generate({ request, fallback });
}

function findChannelByName(guild, name, type = ChannelType.GuildText) {
  return guild.channels.cache.find((channel) => channel.type === type && channel.name === name) || null;
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
  const channelSetupAdapter = createCommunityChannelSetupCompatibilityAdapter({
    guild,
    onboardingVisible: permissionTemplates.onboardingVisible
  });
  const channel = await channelSetupAdapter.ensureGuideChannel({
    categoryName: '📌｜社群入口',
    channelName: GUIDE_CHANNEL_NAME
  });
  const { lookupPort, mutationPort, getRetainedMessage, getRetainedMutationFailure } =
    communityGuideAdapterPairFeature.createAdapterPair({ ensuredChannel: channel });
  const payload = await buildGuidePayload(guild);
  const onboardingJsonReader = createDefaultCommunityOnboardingJsonReader();
  const onboardingStateReader = createCommunityOnboardingStateReader({ onboardingJsonReader });
  const trackingReadPort = createCommunityPublicationTrackingReadCompatibilityAdapter({ onboardingStateReader });
  const trackingReadRequest = createCommunityPublicationTrackingReadRequest({ guildId: guild.id, publication: 'guide' });
  const { trackedMessageId: guideMessageId } = trackingReadPort.readTrackedMessage(trackingReadRequest);
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
  const communityPublicationStateFeature = createCommunityPublicationStateFeature();
  const communityGuidePersistenceFeature = createCommunityGuidePersistenceFeature({ communityPublicationStateFeature });
  const persistenceRequest = createGuidePersistenceRequest({ guildId: guild.id, channelId: channel.id, messageId: message.id, nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS, nativeTaskExcludedChannels: ['🎮｜目前語音房', '🎮｜遊戲中心'] });
  communityGuidePersistenceFeature.persist(persistenceRequest);
  return { channel, message };
}

async function setupRoadmapPanel(guild) {
  const channelSetupAdapter = createCommunityChannelSetupCompatibilityAdapter({
    guild,
    onboardingVisible: permissionTemplates.onboardingVisible
  });
  const channel = await channelSetupAdapter.ensureRoadmapChannel({
    categoryName: '🎮｜遊戲中心',
    channelName: ROADMAP_CHANNEL_NAME
  });
  const { lookupPort, mutationPort, getRetainedMessage } =
    communityRoadmapAdapterPairFeature.createAdapterPair({ ensuredChannel: channel });
  const onboardingJsonReader = createDefaultCommunityOnboardingJsonReader();
  const onboardingStateReader = createCommunityOnboardingStateReader({ onboardingJsonReader });
  const trackingReadPort = createCommunityPublicationTrackingReadCompatibilityAdapter({ onboardingStateReader });
  const trackingReadRequest = createCommunityPublicationTrackingReadRequest({ guildId: guild.id, publication: 'roadmap' });
  const { trackedMessageId: roadmapMessageId } = trackingReadPort.readTrackedMessage(trackingReadRequest);
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
  const communityPublicationStateFeature = createCommunityPublicationStateFeature();
  const communityRoadmapPersistenceFeature = createCommunityRoadmapPersistenceFeature({ communityPublicationStateFeature });
  const persistenceRequest = createRoadmapPublicationPersistenceRequest({ guildId: guild.id, channelId: channel.id, messageId: message.id });
  communityRoadmapPersistenceFeature.persist(persistenceRequest);
  return { channel, message };
}

function quickLinks(guild, kind) {
  if (kind === 'games') return listChannelsByPatterns(guild, [/找隊友|組隊|目前語音|遊戲提議|聊天/i]);
  if (kind === 'invest') return listChannelsByPatterns(guild, [/台股|盤勢|股票|投資/i]);
  if (kind === 'dev') return listChannelsByPatterns(guild, [/程式|AI|開發|作品/i]);
  if (kind === 'night') return listChannelsByPatterns(guild, [/深夜|夜聊|目前語音|一般聊天/i]);
  return [];
}

async function handleConciergeButton(interaction) {
  const action = resolveCommunityConciergeButtonAction(interaction.customId);
  const guild = interaction.guild;
  if (action === 'games') {
    const roleQuickActionFeature = createCommunityRoleQuickActionFeature({
      resolveGuild: () => guild,
      resolveMember: () => interaction.member
    });
    const { added } = await roleQuickActionFeature.communityRoleQuickAction.execute({
      guildId: guild?.id,
      memberId: interaction.member?.id,
      action: 'games'
    });
    const links = quickLinks(guild, 'games');
    const payload = buildCommunityRoleConciergePresentationPayload({ action: 'games', added, links });
    await interaction.reply(payload);
    return true;
  }

  if (action === 'night') {
    const links = quickLinks(guild, 'night');
    const payload = buildCommunityNonRoleConciergePresentationPayload({ action, links });
    await interaction.reply(payload);
    return true;
  }

  if (action === 'bot') {
    const payload = buildCommunityNonRoleConciergePresentationPayload({ action });
    await interaction.reply(payload);
    return true;
  }

  if (action === 'invest' || action === 'dev') {
    const kind = action;
    const roleQuickActionFeature = createCommunityRoleQuickActionFeature({
      resolveGuild: () => guild,
      resolveMember: () => interaction.member
    });
    const { added } = await roleQuickActionFeature.communityRoleQuickAction.execute({
      guildId: guild?.id,
      memberId: interaction.member?.id,
      action: kind
    });
    const links = quickLinks(guild, kind);
    const payload = buildCommunityRoleConciergePresentationPayload({ action: kind, added, links });
    await interaction.reply(payload);
    return true;
  }

  if (action === 'roadmap') {
    const payload = buildCommunityNonRoleConciergePresentationPayload({ action, buildRoadmapEmbed });
    await interaction.reply(payload);
    return true;
  }

  return false;
}

async function sendConciergeWelcome(member) {
  const onboardingJsonReader = createDefaultCommunityOnboardingJsonReader();
  const onboardingStateReader = createCommunityOnboardingStateReader({ onboardingJsonReader });
  const trackingReadPort = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader });
  const trackingReadRequest = createCommunityPublicationChannelTrackingReadRequest({ guildId: member.guild.id, publication: 'guide' });
  const { trackedChannelId: guideChannelId } = trackingReadPort.readTrackedChannel(trackingReadRequest);
  const channelResolver = createCommunityWelcomeChannelResolver({ guild: member.guild, findChannelByName });
  const guideChannel = await channelResolver.resolve({
    trackedChannelId: guideChannelId,
    fallbackChannelName: GUIDE_CHANNEL_NAME
  });
  if (!guideChannel) return;
  const request = mapLegacyWelcomeDeliveryRequest({ guildId: member.guild.id, guideChannelId: guideChannel.id });
  const payload = buildCommunityWelcomeMessage(request, { guildName: member.guild.name });
  const dmDelivery = createCommunityWelcomeDmDeliveryAdapter({ member });
  await dmDelivery.send(payload);
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
