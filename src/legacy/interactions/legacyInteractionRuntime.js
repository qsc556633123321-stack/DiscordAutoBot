const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Events,
  PermissionFlagsBits,
  StringSelectMenuBuilder
} = require('discord.js');
const {
  deleteOrganizePlan,
  getOrganizePlan
} = require('../../systems/organizer');
const {
  deleteDeepCleanupPlan,
  getDeepCleanupPlan
} = require('../../systems/deepCleanupPlanner');
const { executeDeepCleanup } = require('../../systems/deepCleanupExecutor');
const {
  createTemporaryVoice,
  handleTempVoiceButton,
  handleTempVoiceModal,
  handleTempVoiceSelect
} = require('../../systems/tempVoice');
const { inferGameName } = require('../../systems/channelPanels');
const { getRestrictionMessage, isMemberRestricted } = require('../../systems/memberGuard');
const {
  deleteGuestCleanupPlan,
  executeGuestCleanup,
  findRoleChannel,
  getGuestCleanupPlan,
  getRoleOptions,
  getUnlockedCategoriesForRoles,
  setupSelfAssignableRoles,
  updateMemberRoles
} = require('../../systems/roleManager');
const {
  deleteRebuildPlan,
  executeRebuild,
  getRebuildPlan
} = require('../../systems/serverRebuilder');
const {
  deleteCategoryCleanupPlan,
  executeCategoryCleanup,
  getCategoryCleanupPlan
} = require('../../systems/categoryCleaner');
const {
  applyPermissionPlan,
  deleteRolePermissionPlan,
  getRolePermissionPlan
} = require('../../systems/rolePermissions');
const {
  deleteFactoryResetPlan,
  executeFactoryReset,
  getFactoryResetPlan
} = require('../../systems/factoryReset');
const {
  deleteAiReorganizePlan,
  executeAiReorganize,
  getAiReorganizePlan
} = require('../../systems/aiServerReorganizer');
const {
  deleteRestoreActiveChannelsPlan,
  executeRestoreActiveChannels,
  getRestoreActiveChannelsPlan
} = require('../../systems/activeChannelProtector');
const { writeServerLog } = require('../../systems/serverLogs');
const { handleLfgButton } = require('../../systems/lfgSystem');
const { safeDeferUpdate, safeEditReply } = require('../../utils/interactionReplies');
const {
  deletePolishPlan,
  executePolish,
  getPolishPlan
} = require('../../systems/serverPolisher');
const {
  handleCreateSuggestionModal,
  handleGameSuggestionButton,
  listPendingSuggestions,
  showGameSuggestionModal,
  rejectSuggestion
} = require('../../systems/gameSuggestionSystem');
const {
  buildSummaryEmbed,
  deleteDedupePlan,
  executeDedupePlan,
  getDedupePlan
} = require('../../systems/communityBootstrapSystem');
const {
  buildLayoutRepairEmbed,
  deleteLayoutRepairPlan,
  executeLayoutRepairPlan,
  getLayoutRepairPlan
} = require('../../systems/layoutDecisionEngine');
const {
  buildPreviewEmbed: buildCommunityArchitectPreviewEmbed,
  deleteCommunityArchitectPlan,
  executeCommunityArchitectPlan,
  getCommunityArchitectPlan
} = require('../../systems/communityArchitect');
const {
  deleteGameRegistryDoctorPlan,
  executeGameRegistryDoctorPlan,
  getGameRegistryDoctorPlan
} = require('../../systems/gameChannels');
const { buildEmbed: buildGameRegistryDoctorEmbed } = require('../../legacy/commands/game-registry-doctor');
const {
  deleteV3Plan,
  getV3Plan
} = require('../../systems/communityV3Builder');
const { rebuild: communityRebuildService } = require('../../adapters/legacy/legacyCommandAdapters');

const TICKET_CATEGORY_NAME = '🎫｜客服支援';
const TICKET_LOG_CHANNEL_NAME = '📑｜ticket-logs';
const CREATE_TICKET_BUTTON_ID = 'ticket:create';
const CLOSE_TICKET_BUTTON_ID = 'ticket:close';
const CONFIRM_CLOSE_BUTTON_ID = 'ticket:confirm-close';
const CANCEL_CLOSE_BUTTON_ID = 'ticket:cancel-close';
const CONFIRM_AUTO_ORGANIZE_PREFIX = 'confirm_auto_organize_';
const CANCEL_AUTO_ORGANIZE_PREFIX = 'cancel_auto_organize_';
const CONFIRM_DEEP_CLEANUP_PREFIX = 'confirm_deep_cleanup_';
const CANCEL_DEEP_CLEANUP_PREFIX = 'cancel_deep_cleanup_';
const REBUILD_CONFIRM_PREFIX = 'rebuild_confirm_';
const REBUILD_CANCEL_PREFIX = 'rebuild_cancel_';
const CLEANUP_CONFIRM_PREFIX = 'cleanup_confirm_';
const CLEANUP_CANCEL_PREFIX = 'cleanup_cancel_';
const ROLEPERM_CONFIRM_PREFIX = 'roleperm_confirm_';
const ROLEPERM_CANCEL_PREFIX = 'roleperm_cancel_';
const FACTORY_RESET_CONFIRM_PREFIX = 'factory_reset_confirm_';
const FACTORY_RESET_CANCEL_PREFIX = 'factory_reset_cancel_';
const AI_REORGANIZE_CONFIRM_PREFIX = 'ai_reorganize_confirm_';
const AI_REORGANIZE_CANCEL_PREFIX = 'ai_reorganize_cancel_';
const RESTORE_ACTIVE_CONFIRM_PREFIX = 'restore_active_confirm_';
const RESTORE_ACTIVE_CANCEL_PREFIX = 'restore_active_cancel_';
const POLISH_CONFIRM_PREFIX = 'polish_confirm_';
const POLISH_CANCEL_PREFIX = 'polish_cancel_';
const DEDUPE_CONFIRM_PREFIX = 'dedupe_confirm_';
const DEDUPE_CANCEL_PREFIX = 'dedupe_cancel_';
const AI_LAYOUT_CONFIRM_PREFIX = 'ai_layout_confirm_';
const AI_LAYOUT_CANCEL_PREFIX = 'ai_layout_cancel_';
const PERM_REPAIR_CONFIRM_PREFIX = 'permrepair_confirm_';
const PERM_REPAIR_CANCEL_PREFIX = 'permrepair_cancel_';

function safeTicketName(username, userId) {
  const safeName = username
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `ticket-${safeName || userId.slice(-6)}`;
}

function findRole(guild, name) {
  return guild.roles.cache.find((role) => role.name === name);
}

function getTicketOwnerId(channel) {
  const match = channel.topic && channel.topic.match(/Ticket owner: (\d+)/);
  return match ? match[1] : null;
}

function canManageTicket(interaction, ownerId) {
  return (
    interaction.user.id === ownerId ||
    interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels) ||
    interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)
  );
}

function buildTicketOverwrites(guild, userId) {
  const ownerRole = findRole(guild, '站長');
  const adminRole = findRole(guild, '管理員');
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: userId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles
      ]
    },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages
      ]
    }
  ];

  for (const role of [ownerRole, adminRole].filter(Boolean)) {
    overwrites.push({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  return overwrites;
}

async function handleCreateTicket(interaction) {
  if (!interaction.guild) {
    await interaction.reply({ content: '這個按鈕只能在伺服器中使用。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: 'Bot 缺少 ManageChannels 權限，無法建立 Ticket 頻道。',
      ephemeral: true
    });
    return;
  }

  const existingTicket = interaction.guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.name.startsWith('ticket-') &&
      getTicketOwnerId(channel) === interaction.user.id
  );

  if (existingTicket) {
    await interaction.reply({ content: `你已經有一張開啟中的 Ticket：${existingTicket}`, ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    let category = interaction.guild.channels.cache.find(
      (channel) => channel.type === ChannelType.GuildCategory && channel.name === TICKET_CATEGORY_NAME
    );

    if (!category) {
      category = await interaction.guild.channels.create({
        name: TICKET_CATEGORY_NAME,
        type: ChannelType.GuildCategory,
        reason: 'Ticket category created from button interaction'
      });
    }

    const baseName = safeTicketName(interaction.user.username, interaction.user.id);
    const channelName = interaction.guild.channels.cache.some((channel) => channel.name === baseName)
      ? `${baseName}-${interaction.user.id.slice(-4)}`
      : baseName;

    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      topic: `Ticket owner: ${interaction.user.id}`,
      permissionOverwrites: buildTicketOverwrites(interaction.guild, interaction.user.id),
      reason: `Ticket created by ${interaction.user.tag}`
    });

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle('Ticket 已建立')
      .setDescription(`${interaction.user}，請在此描述你的問題。管理團隊會盡快協助你。`)
      .setFooter({ text: '問題處理完畢後，可點擊下方按鈕關閉 Ticket。' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(CLOSE_TICKET_BUTTON_ID)
        .setLabel('關閉 Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({ content: `${interaction.user}`, embeds: [welcomeEmbed], components: [row] });
    await writeServerLog(interaction.guild, {
      title: '🎫 Ticket 已建立',
      description: `${interaction.user} 建立了 ${ticketChannel}。`,
      color: 0x57f287,
      fields: [{ name: 'Ticket', value: ticketChannel.name, inline: true }]
    });
    await interaction.editReply(`Ticket 已建立：${ticketChannel}`);
  } catch (error) {
    console.error('建立 Ticket 失敗：', error);
    await interaction.editReply('建立 Ticket 失敗。請確認 Bot 具有 ManageChannels、View Channels、Send Messages、Embed Links 權限。');
  }
}

async function handleCloseTicket(interaction) {
  if (!interaction.channel || !interaction.channel.name.startsWith('ticket-')) {
    await interaction.reply({ content: '這個按鈕只能在 ticket- 開頭的 Ticket 頻道使用。', ephemeral: true });
    return;
  }

  const ownerId = getTicketOwnerId(interaction.channel);
  if (!canManageTicket(interaction, ownerId)) {
    await interaction.reply({ content: '只有開單者或管理員可以關閉這張 Ticket。', ephemeral: true });
    return;
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(CONFIRM_CLOSE_BUTTON_ID)
      .setLabel('確認關閉')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(CANCEL_CLOSE_BUTTON_ID)
      .setLabel('取消')
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    content: '確定要關閉這張 Ticket 嗎？',
    components: [row],
    ephemeral: true
  });
}

async function handleConfirmClose(interaction) {
  if (!interaction.channel || !interaction.channel.name.startsWith('ticket-')) {
    await interaction.reply({ content: '安全限制：不會刪除非 ticket- 開頭的頻道。', ephemeral: true });
    return;
  }

  const ownerId = getTicketOwnerId(interaction.channel);
  if (!canManageTicket(interaction, ownerId)) {
    await interaction.reply({ content: '只有開單者或管理員可以確認關閉這張 Ticket。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: 'Bot 缺少 ManageChannels 權限，無法刪除 Ticket 頻道。',
      ephemeral: true
    });
    return;
  }

  await interaction.update({ content: 'Ticket 將在 3 秒後關閉。', components: [] });

  try {
    const logChannel = interaction.guild.channels.cache.find(
      (channel) => channel.type === ChannelType.GuildText && channel.name === TICKET_LOG_CHANNEL_NAME
    );

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor(0xeb5757)
        .setTitle('Ticket 已關閉')
        .addFields(
          { name: 'Ticket', value: interaction.channel.name, inline: true },
          { name: '開單者', value: ownerId ? `<@${ownerId}>` : '未知', inline: true },
          { name: '關閉者', value: `${interaction.user}`, inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    }
    await writeServerLog(interaction.guild, {
      title: '🎫 Ticket 已關閉',
      description: `${interaction.user} 關閉了 ${interaction.channel.name}。`,
      color: 0xeb5757,
      fields: [
        { name: '開單者', value: ownerId ? `<@${ownerId}>` : '未知', inline: true },
        { name: '頻道', value: interaction.channel.name, inline: true }
      ]
    });
  } catch (error) {
    console.error('發送 Ticket 紀錄失敗：', error);
  }

  setTimeout(async () => {
    try {
      if (!interaction.channel || !interaction.channel.name.startsWith('ticket-')) return;
      await interaction.channel.delete(`Ticket closed by ${interaction.user.tag}`);
    } catch (error) {
      console.error('刪除 Ticket 頻道失敗：', error);
      try {
        await interaction.followUp({
          content: '刪除 Ticket 頻道失敗，請確認 Bot 權限與角色位置。',
          ephemeral: true
        });
      } catch (followUpError) {
        console.error('回覆刪除失敗訊息時發生錯誤：', followUpError);
      }
    }
  }, 3000);
}

async function handleCancelClose(interaction) {
  await interaction.update({ content: '已取消關閉 Ticket。', components: [] });
}

function getAutoOrganizePlanId(customId, prefix) {
  return customId.startsWith(prefix) ? customId.slice(prefix.length) : null;
}

async function handleCancelAutoOrganize(interaction, planId) {
  const plan = getOrganizePlan(planId);

  if (!plan) {
    await interaction.reply({ content: '這份搬家方案已過期或不存在。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /auto-organize 的人可以取消這份方案。', ephemeral: true });
    return;
  }

  deleteOrganizePlan(planId);
  await interaction.update({
    content: '已取消自動搬家，不做任何變更。',
    embeds: [],
    components: []
  });
}

async function handleConfirmAutoOrganize(interaction, planId) {
  const plan = getOrganizePlan(planId);

  if (!plan) {
    await interaction.reply({ content: '這份搬家方案已過期或不存在，請重新執行 `/auto-organize`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /auto-organize 的人可以確認這份方案。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份搬家方案不屬於目前伺服器。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能執行搬家。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: 'Bot 缺少 ManageChannels 權限，無法建立分類或移動頻道。',
      ephemeral: true
    });
    return;
  }

  await interaction.update({
    content: '正在執行自動搬家，請稍候...',
    embeds: [],
    components: []
  });

  const createdCategories = [];
  const movedChannels = [];
  const skippedChannels = [];
  const failedOperations = [];
  const categoryByName = new Map(
    [...interaction.guild.channels.cache.values()]
      .filter((channel) => channel.type === ChannelType.GuildCategory)
      .map((category) => [category.name, category])
  );

  try {
    for (const categoryName of plan.categoriesToCreate) {
      if (categoryByName.has(categoryName)) continue;

      try {
        const category = await interaction.guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          reason: `Auto organize confirmed by ${interaction.user.tag}`
        });
        categoryByName.set(category.name, category);
        createdCategories.push(category.name);
      } catch (error) {
        console.error(`建立分類 ${categoryName} 失敗：`, error);
        failedOperations.push(`建立分類失敗：${categoryName}`);
      }
    }

    for (const move of plan.moves.slice(0, 20)) {
      try {
        const channel = interaction.guild.channels.cache.get(move.channelId);
        const targetCategory = categoryByName.get(move.suggestedCategoryName);

        if (!channel) {
          skippedChannels.push(`${move.channelName}：頻道不存在`);
          continue;
        }

        if (channel.type === ChannelType.GuildCategory) {
          skippedChannels.push(`${channel.name}：不搬移分類本身`);
          continue;
        }

        if (channel.id === plan.sourceChannelId) {
          skippedChannels.push(`${channel.name}：不搬移執行指令的頻道`);
          continue;
        }

        if (channel.name.startsWith('ticket-')) {
          skippedChannels.push(`${channel.name}：不搬移私人客服單`);
          continue;
        }

        if (!targetCategory) {
          failedOperations.push(`${channel.name}：找不到目標分類 ${move.suggestedCategoryName}`);
          continue;
        }

        if (channel.parentId === targetCategory.id) {
          skippedChannels.push(`${channel.name}：已在目標分類`);
          continue;
        }

        await channel.setParent(targetCategory.id, {
          lockPermissions: false,
          reason: `Auto organize confirmed by ${interaction.user.tag}`
        });
        movedChannels.push(`${channel.name} -> ${targetCategory.name}`);
      } catch (error) {
        console.error(`搬移頻道 ${move.channelName} 失敗：`, error);
        failedOperations.push(`搬移失敗：${move.channelName}`);
      }
    }
  } catch (error) {
    console.error('自動搬家執行失敗：', error);
    failedOperations.push('執行過程發生未預期錯誤');
  } finally {
    deleteOrganizePlan(planId);
  }

  const summary = [
    `建立分類：${createdCategories.length ? createdCategories.join('、') : '無'}`,
    `成功搬移：${movedChannels.length} 個`,
    movedChannels.length ? movedChannels.map((item) => `• ${item}`).join('\n') : null,
    skippedChannels.length ? `略過：\n${skippedChannels.map((item) => `• ${item}`).join('\n')}` : null,
    failedOperations.length ? `失敗：\n${failedOperations.map((item) => `• ${item}`).join('\n')}` : null
  ].filter(Boolean).join('\n\n');

  await writeServerLog(interaction.guild, {
    title: '🧭 Auto Organize 已執行',
    description: `${interaction.user} 確認執行自動搬家。`,
    color: failedOperations.length ? 0xf2c94c : 0x57f287,
    fields: [
      { name: '建立分類', value: createdCategories.join('\n').slice(0, 1024) || '無' },
      { name: '搬移頻道', value: movedChannels.join('\n').slice(0, 1024) || '無' },
      { name: '失敗', value: failedOperations.join('\n').slice(0, 1024) || '無' }
    ]
  });

  await interaction.editReply({
    content: `自動搬家完成摘要：\n\n${summary.slice(0, 1900)}`,
    embeds: [],
    components: []
  });
}

function getDeepCleanupPlanId(customId, prefix) {
  return customId.startsWith(prefix) ? customId.slice(prefix.length) : null;
}

async function handleCancelDeepCleanup(interaction, planId) {
  const plan = getDeepCleanupPlan(planId);

  if (!plan) {
    await interaction.reply({ content: '這份深度整理方案已過期或不存在。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /deep-cleanup 的人可以取消這份方案。', ephemeral: true });
    return;
  }

  deleteDeepCleanupPlan(planId);
  await interaction.update({
    content: '已取消深度整理，不做任何變更。',
    embeds: [],
    components: []
  });
}

async function handleConfirmDeepCleanup(interaction, planId) {
  const plan = getDeepCleanupPlan(planId);

  if (!plan) {
    await interaction.reply({ content: '這份深度整理方案已過期或不存在，請重新執行 `/deep-cleanup`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /deep-cleanup 的人可以確認這份方案。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份深度整理方案不屬於目前伺服器。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能執行深度整理。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法執行深度整理。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: '這份方案是 preview 模式，不能執行。請用 mode: execute 重新產生方案。', ephemeral: true });
    return;
  }

  await interaction.update({
    content: '正在執行深度整理。若包含刪除項目，會先改名並等待 5 秒再刪除...',
    embeds: [],
    components: []
  });

  try {
    const summary = await executeDeepCleanup(interaction, plan);
    deleteDeepCleanupPlan(planId);

    const lines = [
      `建立分類：${summary.createdCategories.length ? summary.createdCategories.join('、') : '無'}`,
      `搬移頻道：${summary.movedChannels.length} 個`,
      `封存頻道：${summary.archivedChannels.length} 個`,
      `刪除頻道：${summary.deletedChannels.length ? summary.deletedChannels.join('、') : '無'}`,
      summary.failedOperations.length ? `失敗：\n${summary.failedOperations.map((item) => `• ${item}`).join('\n')}` : null
    ].filter(Boolean);

    await interaction.editReply({
      content: `深度整理完成摘要：\n\n${lines.join('\n\n').slice(0, 1900)}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('深度整理執行失敗：', error);
    await interaction.editReply({
      content: '深度整理執行失敗。請確認 Bot 權限、角色位置與頻道權限是否足夠。',
      embeds: [],
      components: []
    });
  }
}

async function handlePanelCreateVoice(interaction) {
  const customGame = interaction.customId.includes(':')
    ? interaction.customId.split(':').slice(1).join(':')
    : '';
  const game = customGame || inferGameName(interaction.channel);

  if (!game) {
    await interaction.reply({ content: '無法判斷遊戲名稱，請使用 `/create-party` 建立臨時語音。', ephemeral: true });
    return;
  }

  if (isMemberRestricted(interaction.member)) {
    await interaction.reply({ content: getRestrictionMessage(), ephemeral: true });
    return;
  }

  if (
    !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels) ||
    !interaction.guild.members.me.permissions.has(PermissionFlagsBits.MoveMembers)
  ) {
    await interaction.reply({ content: 'Bot 需要 ManageChannels 與 MoveMembers 權限才能建立臨時語音。', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await createTemporaryVoice({
      guild: interaction.guild,
      member: interaction.member,
      game,
      limit: 5
    });

    if (interaction.member.voice.channel) {
      try {
        await interaction.member.voice.setChannel(channel, 'Panel temporary party voice');
        await interaction.editReply(`已建立臨時語音 ${channel}，並將你移動進去。`);
        return;
      } catch (error) {
        console.error('面板移動使用者到臨時語音失敗：', error);
      }
    }

    await interaction.editReply(`已建立臨時語音 ${channel}，請自行加入。`);
  } catch (error) {
    console.error('面板建立臨時語音失敗：', error);
    await interaction.editReply(`建立臨時語音失敗：${error.message}`);
  }
}

async function handlePanelOpenRoles(interaction) {
  if (!interaction.guild) {
    await interaction.reply({ content: '這個按鈕只能在伺服器內使用。', ephemeral: true });
    return;
  }

  const options = getRoleOptions();
  if (!options.length) {
    await interaction.reply({ content: '目前沒有可領取的身分組設定。', ephemeral: true });
    return;
  }

  try {
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: 'Bot 缺少 ManageRoles 權限，無法自動建立或分配身分組。請管理員調整 Bot 權限與角色順位。',
        ephemeral: true
      });
      return;
    }

    await setupSelfAssignableRoles(interaction.guild);

    const unmanageable = options
      .map((option) => interaction.guild.roles.cache.find((role) => role.name === option.value))
      .filter((role) => role && !role.editable)
      .map((role) => role.name);

    if (unmanageable.length) {
      await interaction.reply({
        content: `Bot 角色順位不足，無法管理以下身分組：${unmanageable.join('、')}\n請把 Bot 角色移到這些身分組上方後再試。`,
        ephemeral: true
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x9b51e0)
      .setTitle('🎭 領取身分組')
      .setDescription('請選擇你感興趣的分類，可多選。取消勾選的本系統身分組會被移除。')
      .setFooter({ text: '你的可見頻道會依身分組更新' })
      .setTimestamp();

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('role_select_menu')
        .setPlaceholder('選擇你的興趣分類')
        .setMinValues(0)
        .setMaxValues(options.length)
        .addOptions(options)
    );

    const components = [selectRow];
    const roleChannel = findRoleChannel(interaction.guild);
    if (roleChannel) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('前往身分組頻道')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${roleChannel.id}`)
        )
      );
    }

    await interaction.reply({ embeds: [embed], components, ephemeral: true });
  } catch (error) {
    console.error('開啟身分組選單失敗:', error);
    await interaction.reply({
      content: `無法開啟身分組選單：${error.message}\n請確認 Bot 擁有 ManageRoles，且 Bot 角色順位高於要發放的身分組。`,
      ephemeral: true
    });
  }
}

function listGameCategories(guild) {
  const categories = guild.channels.cache
    .filter((channel) => channel.type === ChannelType.GuildCategory && /^🎮｜/.test(channel.name) && !/遊戲中心|遊戲大廳/.test(channel.name))
    .map((channel) => `- ${channel.name}`)
    .slice(0, 20);
  return categories.length ? categories.join('\n') : '目前還沒有專屬遊戲分類，可以使用 `/suggest-game game_name reason` 提議。';
}

async function handlePanelButton(interaction) {
  if (interaction.customId === 'panel_create_ticket') {
    await handleCreateTicket(interaction);
    return;
  }

  if (interaction.customId.startsWith('panel_create_voice')) {
    await handlePanelCreateVoice(interaction);
    return;
  }

  if (interaction.customId === 'panel_open_roles') {
    await handlePanelOpenRoles(interaction);
    return;
  }

  if (interaction.customId === 'panel_intro_format') {
    await interaction.reply({
      content: '自我介紹格式：\n```text\n暱稱：\n常玩遊戲：\n興趣：\n想交流的內容：\n```',
      ephemeral: true
    });
    return;
  }

  if (interaction.customId === 'panel_suggest_game') {
    await showGameSuggestionModal(interaction);
    return;
  }

  if (interaction.customId === 'panel_show_game_suggestion_flow') {
    await interaction.reply({
      content:
        `目前提議：\n${listPendingSuggestions(interaction.guild.id)}\n\n` +
        '流程：按「提議新遊戲」填表單，其他人投票，管理員批准後 Bot 會自動建立遊戲分類、聊天、找隊友、資訊與語音入口。',
      ephemeral: true
    });
    return;
  }

  if (interaction.customId === 'panel_show_game_categories') {
    await interaction.reply({
      content: `目前已存在的遊戲分類：\n${listGameCategories(interaction.guild)}`,
      ephemeral: true
    });
    return;
  }

  const responses = {
    panel_read_rules: '感謝閱讀規則。',
    panel_open_roles: '請前往身分組領取頻道，或請管理員使用 `/setup-roles` 建立身分組面板。',
    panel_show_guide: '請查看 `伺服器導覽` 頻道，或請管理員使用 `/setup-channel-panels` 建立導覽面板。',
    panel_rules_read: '感謝閱讀規則，歡迎加入社群。',
    panel_claim_roles: '請等待後續身分組系統。',
    panel_subscribe_announcement: '公告訂閱功能待加入。',
    panel_show_info: '請查看社群入口分類中的規則、公告與新人報到頻道。',
    panel_interest_gamer: '已收到：你是遊戲玩家。身分組系統完成後可自動領取。',
    panel_interest_chat: '已收到：你想聊天交友。歡迎到日常大廳交流。',
    panel_interest_dev: '已收到：你對開發有興趣。之後可接上身分組系統。',
    panel_interest_stock: '已收到：你對股票有興趣。之後可接上身分組系統。',
    panel_show_games: '請前往各 `🎮｜遊戲名稱` 分類查看遊戲頻道。想新增遊戲可到 `📋｜遊戲提議` 使用 `/suggest-game`。',
    panel_show_rules: '請查看 `社群規則` 或規則頻道。',
    panel_show_chat: '請前往 `💬｜一般聊天`。這裡適合打招呼、生活閒聊與輕鬆話題。',
    panel_show_serious_discussion: '請前往 `🧠｜認真討論`。這裡適合較深入的觀點交流、科技、AI、社群想法與長篇討論。',
    panel_show_discussion_format: '認真討論建議格式：\n```text\n主題：\n背景：\n我的想法：\n想聽大家討論的是：\n```',
    panel_show_game_suggestions: '請前往 `📋｜遊戲提議`，按「🎮 提議新遊戲」填表單即可，不需要記 slash command。',
    panel_show_party: '請前往該遊戲的找隊友頻道。',
    panel_show_party_format: '組隊格式：\n```text\n遊戲：\n模式：\n人數：\n牌位：\n語音：\n備註：\n```',
    panel_show_suggestion_format: '建議格式：\n```text\n建議類型：\n相關頻道：\n具體內容：\n預期效果：\n```',
    panel_show_clip_format: '分享格式：\n```text\n遊戲：\n模式：\n戰績/精華：\n影片或圖片：\n想說的話：\n```',
    panel_show_photo_hint: '分享照片時歡迎附上地區、店名、品項與簡短心得。',
    panel_show_food_format: '推薦格式：\n```text\n地區：\n店名：\n品項：\n價格：\n推薦原因：\n```',
    panel_show_image_rules: '發圖規範：禁止色情、血腥、惡意攻擊、個資外洩與違法內容。',
    panel_hint_analyze: '請使用 `/analyze-server`。',
    panel_hint_deep_cleanup: '請使用 `/deep-cleanup`。',
    panel_hint_setup_ticket: '請使用 `/setup-ticket`。',
    panel_hint_setup_game: '請使用 `/setup-game`。',
    panel_hint_setup_roles: '請使用 `/setup-roles`。',
    panel_hint_announce: '請使用 `/announce`。'
  };

  await interaction.reply({
    content: responses[interaction.customId] || '這個面板功能尚未實作。',
    ephemeral: true
  });
}

async function handleRoleSelectMenu(interaction) {
  try {
    const result = await updateMemberRoles(interaction);
    const lines = [
      result.added.length ? `新增：${result.added.join('、')}` : null,
      result.removed.length ? `移除：${result.removed.join('、')}` : null,
      result.failed.length ? `未處理：${result.failed.join('、')}` : null
    ].filter(Boolean);

    await interaction.reply({
      content: `已更新你的身分組，你的可見頻道已依身分組更新。\n${lines.join('\n') || '沒有變更。'}`,
      ephemeral: true
    });
  } catch (error) {
    console.error('更新自助身分組失敗：', error);
    await interaction.reply({
      content: `更新身分組失敗：${error.message}`,
      ephemeral: true
    });
  }
}

function getPrefixedId(customId, prefix) {
  return customId.startsWith(prefix) ? customId.slice(prefix.length) : null;
}

async function handleRoleSelectMenuV2(interaction) {
  try {
    const result = await updateMemberRoles(interaction);
    const unlockedCategories = result.unlockedCategories?.length
      ? result.unlockedCategories
      : getUnlockedCategoriesForRoles(interaction.values || []);
    const lines = [
      result.added.length ? `✅ 已加入：${result.added.join('、')}` : null,
      result.removed.length ? `❌ 已移除：${result.removed.join('、')}` : null,
      result.guestRemoved ? '🧹 已移除訪客身分組' : null,
      result.guestRemoved ? '✅ 已完成驗證' : null,
      result.guestRestored ? '👤 已恢復訪客身分組' : null,
      unlockedCategories.length ? `🔓 已解鎖分類：${unlockedCategories.join('、')}` : '🔓 目前沒有選擇會解鎖新分類的身分組。',
      result.failed.length ? `⚠️ 未能更新：${result.failed.join('、')}` : null
    ].filter(Boolean);

    await interaction.reply({
      content: `已更新你的身分組。\n${lines.join('\n')}\n你的可見頻道會依身分組更新。`,
      ephemeral: true
    });
  } catch (error) {
    console.error('更新自助身分組失敗:', error);
    await interaction.reply({
      content: `更新身分組失敗：${error.message}\n請確認 Bot 有 ManageRoles 權限，且 Bot 角色順位高於要管理的身分組。`,
      ephemeral: true
    });
  }
}

async function handleConfirmGuestCleanup(interaction, planId) {
  await safeDeferUpdate(interaction);

  const plan = getGuestCleanupPlan(planId);
  if (!plan) {
    await safeEditReply(interaction, { content: '這份訪客清理計畫已過期，請重新執行 `/cleanup-guest-roles mode:execute`。', components: [] });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await safeEditReply(interaction, { content: '只有原本執行 `/cleanup-guest-roles` 的管理員可以確認這次清理。', components: [] });
    return;
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
    await safeEditReply(interaction, { content: '你需要 ManageRoles 權限才能清理訪客身分組。', components: [] });
    return;
  }

  try {
    await safeEditReply(interaction, {
      content: '🧹 正在清理訪客身分組...\n已完成：0/?',
      components: []
    });

    const result = await executeGuestCleanup(interaction.guild, {
      plan,
      onProgress: async ({ completed, total }) => {
        await safeEditReply(interaction, {
          content: `🧹 正在清理訪客身分組...\n已完成：${completed}/${total}`,
          components: []
        }).catch(() => null);
      }
    });

    await safeEditReply(interaction, {
      content:
        `✅ 清理完成\n` +
        `成功：${result.cleaned.length}\n` +
        `失敗：${result.failed.length}\n` +
        `略過：${result.skipped.length}\n\n` +
        `失敗原因：${result.failed.length ? result.failed.join('、') : '無'}`,
      components: []
    });
    deleteGuestCleanupPlan(planId);
  } catch (error) {
    console.error('confirm guest cleanup failed:', error);
    await safeEditReply(interaction, { content: '⚠️ 執行失敗，請查看 console logs。', components: [] });
  }
}

async function handleCancelGuestCleanup(interaction, planId) {
  await safeDeferUpdate(interaction);

  const plan = getGuestCleanupPlan(planId);
  if (!plan) {
    await safeEditReply(interaction, { content: '這份訪客清理計畫已過期，不需要取消。', components: [] });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await safeEditReply(interaction, { content: '只有原本執行 `/cleanup-guest-roles` 的管理員可以取消這次清理。', components: [] });
    return;
  }

  deleteGuestCleanupPlan(planId);
  await safeEditReply(interaction, { content: '已取消清理訪客身分組，沒有修改任何成員。', components: [] });
}

async function handleConfirmPolish(interaction, planId) {
  await safeDeferUpdate(interaction);
  const plan = getPolishPlan(planId);
  if (!plan) {
    await safeEditReply(interaction, { content: '這份完善計畫已過期，請重新執行 `/polish-server-design`。', embeds: [], components: [] });
    return;
  }
  if (interaction.user.id !== plan.requestedById) {
    await safeEditReply(interaction, { content: '只有原本執行 `/polish-server-design` 的管理員可以確認。', embeds: [], components: [] });
    return;
  }
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await safeEditReply(interaction, { content: '你需要 ManageGuild 權限才能執行完善。', embeds: [], components: [] });
    return;
  }

  try {
    await safeEditReply(interaction, { content: '✨ 正在完善社群結構，請稍候...', embeds: [], components: [] });
    const summary = await executePolish(interaction.guild, plan);
    deletePolishPlan(planId);
    await safeEditReply(interaction, {
      content:
        `✨ 社群完善完成\n` +
        `建立分類：${summary.createdCategories.length}\n` +
        `建立頻道：${summary.createdChannels.length}\n` +
        `移動頻道：${summary.movedChannels.length}\n` +
        `重新命名：${summary.renamedChannels.length}\n` +
        `建立身分組：${summary.createdRoles.length}\n` +
        `更新身分組：${summary.updatedRoles.length}\n` +
        `原生功能：${summary.nativeUpdates.join('、') || '無'}\n` +
        `失敗：${summary.failed.length ? summary.failed.join('、').slice(0, 1500) : '無'}\n\n` +
        `需要手動設定：\n${summary.manualNativeFeatureNotes.join('\n')}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('confirm polish failed:', error);
    await safeEditReply(interaction, { content: '⚠️ 執行失敗，請查看 console logs。', embeds: [], components: [] });
  }
}

async function handleCancelPolish(interaction, planId) {
  await safeDeferUpdate(interaction);
  const plan = getPolishPlan(planId);
  if (plan && interaction.user.id !== plan.requestedById) {
    await safeEditReply(interaction, { content: '只有原本執行 `/polish-server-design` 的管理員可以取消。', embeds: [], components: [] });
    return;
  }
  deletePolishPlan(planId);
  await safeEditReply(interaction, { content: '已取消社群完善，沒有修改任何設定。', embeds: [], components: [] });
}

async function handleCancelRebuild(interaction, planId) {
  const plan = getRebuildPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份大洗牌方案已過期或不存在。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /rebuild-server 的人可以取消這份方案。', ephemeral: true });
    return;
  }

  deleteRebuildPlan(planId);
  await interaction.update({ content: '已取消一鍵大洗牌，不做任何變更。', embeds: [], components: [] });
}

async function handleConfirmRebuild(interaction, planId) {
  const plan = getRebuildPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份大洗牌方案已過期或不存在，請重新執行 `/rebuild-server`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /rebuild-server 的人可以確認這份方案。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份大洗牌方案不屬於目前伺服器。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能執行一鍵大洗牌。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: '這份方案是 preview 模式，不能執行。請用 mode: execute 重新產生方案。', ephemeral: true });
    return;
  }

  await interaction.update({
    content: '正在執行一鍵大洗牌。若包含 delete，舊頻道會先改名並等待 5 秒再刪除...',
    embeds: [],
    components: []
  });

  try {
    const summary = await executeRebuild(interaction, plan);
    deleteRebuildPlan(planId);
    const lines = [
      `建立分類：${summary.createdCategories.length ? summary.createdCategories.join('、') : '無'}`,
      `建立頻道：${summary.createdChannels.length} 個`,
      `封存舊頻道：${summary.archivedOldChannels.length} 個`,
      `刪除舊頻道：${summary.deletedOldChannels.length ? summary.deletedOldChannels.join('、') : '無'}`,
      summary.skipped.length ? `略過：${summary.skipped.length} 個` : null,
      summary.failed.length ? `失敗：\n${summary.failed.map((item) => `• ${item}`).join('\n')}` : null
    ].filter(Boolean);

    await interaction.editReply({
      content: `一鍵大洗牌完成摘要：\n\n${lines.join('\n\n').slice(0, 1900)}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('一鍵大洗牌執行失敗：', error);
    await interaction.editReply({
      content: '一鍵大洗牌執行失敗。請確認 Bot 權限、角色位置與頻道權限是否足夠。',
      embeds: [],
      components: []
    });
  }
}

async function handleCancelCategoryCleanup(interaction, planId) {
  const plan = getCategoryCleanupPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份空分類清理方案已過期或不存在。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /cleanup-empty-categories 的人可以取消。', ephemeral: true });
    return;
  }

  deleteCategoryCleanupPlan(planId);
  await interaction.update({ content: '已取消空分類清理，不做任何變更。', embeds: [], components: [] });
}

async function handleConfirmCategoryCleanup(interaction, planId) {
  const plan = getCategoryCleanupPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份空分類清理方案已過期或不存在。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 /cleanup-empty-categories 的人可以確認。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能清理空分類。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: '這份方案是 preview 模式，不能執行。', ephemeral: true });
    return;
  }

  await interaction.update({ content: '正在清理空分類...', embeds: [], components: [] });

  try {
    const summary = await executeCategoryCleanup(interaction.guild, plan);
    deleteCategoryCleanupPlan(planId);
    await interaction.editReply({
      content:
        `空分類清理完成：\n\n` +
        `封存/改名：${summary.renamed.length ? summary.renamed.join('、') : '無'}\n` +
        `刪除：${summary.deleted.length ? summary.deleted.join('、') : '無'}\n` +
        `略過：${summary.skipped.length}\n` +
        `失敗：${summary.failed.length}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('空分類清理失敗：', error);
    await interaction.editReply({ content: '空分類清理失敗，請確認 Bot 權限與分類狀態。', embeds: [], components: [] });
  }
}

async function handleCancelRolePermissions(interaction, planId) {
  const plan = getRolePermissionPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份身分組權限套用計畫已過期，請重新執行 `/apply-role-permissions`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/apply-role-permissions` 的管理員可以取消這次操作。', ephemeral: true });
    return;
  }

  deleteRolePermissionPlan(planId);
  await interaction.update({ content: '已取消套用身分組頻道權限，沒有修改任何頻道。', embeds: [], components: [] });
}

async function handleConfirmRolePermissions(interaction, planId) {
  const plan = getRolePermissionPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份身分組權限套用計畫已過期，請重新執行 `/apply-role-permissions`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/apply-role-permissions` 的管理員可以確認這次操作。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份計畫不屬於目前伺服器，請重新產生。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能套用頻道可見性。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法修改分類權限。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: 'preview 模式不能執行修改，請用 `mode: execute` 重新產生確認按鈕。', ephemeral: true });
    return;
  }

  const hierarchyWarning = plan.warnings.find((warning) => warning.includes('Bot') && warning.includes('角色'));
  if (hierarchyWarning) {
    await interaction.reply({
      content: `Bot 角色順位不足，為了避免套用到一半失敗，本次不執行。\n${hierarchyWarning}\n請把 Bot 角色移到要管理的身分組上方後再試。`,
      ephemeral: true
    });
    return;
  }

  await interaction.update({ content: '正在套用身分組與頻道權限連動設定...', embeds: [], components: [] });

  try {
    const summary = await applyPermissionPlan(interaction.guild, plan);
    deleteRolePermissionPlan(planId);
    await interaction.editReply({
      content:
        `身分組頻道權限已套用完成。\n\n` +
        `已更新分類：${summary.updatedCategories.length ? summary.updatedCategories.join('、') : '無'}\n` +
        `已同步子頻道：${summary.syncedChannels.length}\n` +
        `略過：${summary.skipped.length}\n` +
        `失敗：${summary.failed.length ? summary.failed.join('\n') : '無'}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('套用身分組頻道權限失敗:', error);
    await interaction.editReply({
      content: `套用身分組頻道權限失敗：${error.message}`,
      embeds: [],
      components: []
    });
  }
}

async function handleCancelFactoryReset(interaction, planId) {
  const plan = getFactoryResetPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份工廠重置計畫已過期，請重新執行 `/factory-reset-server`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/factory-reset-server` 的管理員可以取消這次操作。', ephemeral: true });
    return;
  }

  deleteFactoryResetPlan(planId);
  await interaction.update({ content: '已取消工廠重置，沒有修改任何頻道、分類或角色。', embeds: [], components: [] });
}

async function handleConfirmFactoryReset(interaction, planId) {
  const plan = getFactoryResetPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '這份工廠重置計畫已過期，請重新執行 `/factory-reset-server`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/factory-reset-server` 的管理員可以確認這次操作。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份工廠重置計畫不屬於目前伺服器，請重新產生。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能執行工廠重置。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法執行工廠重置。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: 'preview 模式不能執行重置，請用 `mode: execute` 重新產生確認按鈕。', ephemeral: true });
    return;
  }

  await interaction.update({
    content: '正在執行工廠重置。會先刪除 Bot panel/temp/ticket/模板結構，再重建模板與權限...',
    embeds: [],
    components: []
  });

  try {
    const summary = await executeFactoryReset(interaction, plan);
    deleteFactoryResetPlan(planId);
    await interaction.editReply({
      content:
        `工廠重置完成。\n\n` +
        `刪除 panel 訊息：${summary.deletedPanelMessages.length}\n` +
        `刪除頻道：${summary.deletedChannels.length}\n` +
        `刪除分類：${summary.deletedCategories.length}\n` +
        `刪除角色：${summary.deletedRoles.length}\n` +
        `清空資料：${summary.clearedData.join('、') || '無'}\n` +
        `重建分類：${summary.rebuild.createdCategories.length}\n` +
        `重建頻道：${summary.rebuild.createdChannels.length}\n` +
        `略過：${summary.skipped.length}\n` +
        `失敗：${summary.failed.length ? summary.failed.join('\n').slice(0, 900) : '無'}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('工廠重置失敗:', error);
    await interaction.editReply({
      content: `工廠重置失敗：${error.message}`,
      embeds: [],
      components: []
    });
  }
}

async function handleCancelAiReorganize(interaction, planId) {
  const plan = getAiReorganizePlan(planId);
  if (!plan) {
    await interaction.reply({ content: '找不到 AI 重整計畫，請重新執行 `/ai-reorganize-server`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/ai-reorganize-server` 的人可以取消這份計畫。', ephemeral: true });
    return;
  }

  deleteAiReorganizePlan(planId);
  await interaction.update({ content: '已取消 AI 伺服器重整，沒有做任何變更。', embeds: [], components: [] });
}

async function handleConfirmAiReorganize(interaction, planId) {
  const plan = getAiReorganizePlan(planId);
  if (!plan) {
    await interaction.reply({ content: '找不到 AI 重整計畫，請重新執行 `/ai-reorganize-server`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/ai-reorganize-server` 的人可以確認這份計畫。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份 AI 重整計畫不屬於目前伺服器。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能執行 AI 重整。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法執行 AI 重整。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await interaction.reply({ content: 'Bot 缺少 ManageRoles 權限，無法建立或套用身分組權限。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: 'preview 計畫不能執行，請用 mode: execute 重新產生確認計畫。', ephemeral: true });
    return;
  }

  await interaction.update({
    content: '正在執行 AI 伺服器重整：建立分類、搬移頻道、套用身分組權限與清理舊分類...',
    embeds: [],
    components: []
  });

  try {
    const summary = await executeAiReorganize(interaction, plan);
    deleteAiReorganizePlan(planId);
    const lines = [
      `建立分類：${summary.createdCategories.length ? summary.createdCategories.join('、') : '無'}`,
      `建立頻道：${summary.createdChannels.length}`,
      `移動頻道：${summary.movedChannels.length}`,
      `封存舊頻道：${summary.archivedChannels.length}`,
      `刪除舊頻道：${summary.deletedChannels.length ? summary.deletedChannels.join('、') : '無'}`,
      `套用權限分類：${summary.updatedPermissions.length}`,
      summary.categoryCleanup ? `空分類清理：封存 ${summary.categoryCleanup.renamed.length}，刪除 ${summary.categoryCleanup.deleted.length}` : null,
      summary.failed.length ? `失敗：\n${summary.failed.slice(0, 10).join('\n')}` : null,
      summary.skipped.length ? `略過：${summary.skipped.length} 項` : null
    ].filter(Boolean);

    await interaction.editReply({
      content: `AI 伺服器重整完成。\n\n${lines.join('\n').slice(0, 1900)}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('AI 伺服器重整失敗：', error);
    await interaction.editReply({
      content: `AI 伺服器重整失敗：${error.message}`,
      embeds: [],
      components: []
    });
  }
}

async function handleCancelRestoreActiveChannels(interaction, planId) {
  const plan = getRestoreActiveChannelsPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '找不到還原計畫，請重新執行 `/restore-active-channels`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/restore-active-channels` 的人可以取消。', ephemeral: true });
    return;
  }

  deleteRestoreActiveChannelsPlan(planId);
  await interaction.update({ content: '已取消有效頻道還原，沒有做任何變更。', embeds: [], components: [] });
}

async function handleConfirmRestoreActiveChannels(interaction, planId) {
  const plan = getRestoreActiveChannelsPlan(planId);
  if (!plan) {
    await interaction.reply({ content: '找不到還原計畫，請重新執行 `/restore-active-channels`。', ephemeral: true });
    return;
  }

  if (interaction.user.id !== plan.requestedById) {
    await interaction.reply({ content: '只有原本執行 `/restore-active-channels` 的人可以確認。', ephemeral: true });
    return;
  }

  if (!interaction.guild || interaction.guild.id !== plan.guildId) {
    await interaction.reply({ content: '這份還原計畫不屬於目前伺服器。', ephemeral: true });
    return;
  }

  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: '你需要 ManageChannels 權限才能還原頻道。', ephemeral: true });
    return;
  }

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法移動頻道。', ephemeral: true });
    return;
  }

  if (plan.mode !== 'execute') {
    await interaction.reply({ content: 'preview 計畫不能執行，請使用 mode: execute 重新產生計畫。', ephemeral: true });
    return;
  }

  await interaction.update({ content: '正在還原誤封存的有效頻道...', embeds: [], components: [] });

  try {
    const summary = await executeRestoreActiveChannels(interaction.guild, plan);
    deleteRestoreActiveChannelsPlan(planId);
    await interaction.editReply({
      content:
        `有效頻道還原完成。\n\n` +
        `建立分類：${summary.createdCategories.length ? summary.createdCategories.join('、') : '無'}\n` +
        `已移動：${summary.movedChannels.length ? `\n${summary.movedChannels.join('\n')}` : '無'}\n` +
        `略過：${summary.skipped.length ? summary.skipped.join('、') : '無'}\n` +
        `失敗：${summary.failed.length ? summary.failed.join('\n') : '無'}`,
      embeds: [],
      components: []
    });
  } catch (error) {
    console.error('還原有效頻道失敗：', error);
    await interaction.editReply({ content: `還原有效頻道失敗：${error.message}`, embeds: [], components: [] });
  }
}

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'game_suggest_create_modal') {
        try {
          await handleCreateSuggestionModal(interaction);
        } catch (error) {
          console.error('Game suggestion create modal failed:', error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '送出遊戲提議時發生錯誤，請稍後再試。', ephemeral: true });
          } else {
            await interaction.editReply({ content: '送出遊戲提議時發生錯誤，請稍後再試。' }).catch(() => null);
          }
        }
        return;
      }

      if (interaction.customId.startsWith('game_suggest_reject_modal_')) {
        try {
          await rejectSuggestion(interaction, interaction.customId.replace('game_suggest_reject_modal_', ''));
        } catch (error) {
          console.error('Game suggestion reject modal failed:', error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '處理遊戲提議拒絕時發生錯誤。', ephemeral: true });
          }
        }
        return;
      }

      if (interaction.customId.startsWith('tempvoice_')) {
        try {
          await handleTempVoiceModal(interaction);
        } catch (error) {
          console.error('Temp Voice modal interaction failed:', error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '處理語音房操作失敗，請稍後再試。', ephemeral: true });
          }
        }
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`執行 /${interaction.commandName} 時發生錯誤：`, error);

        const errorMessage = {
          content: '執行指令時發生錯誤，請確認 Bot 角色權限與頻道權限是否足夠。',
          ephemeral: true
        };

        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('tempvoice_')) {
        try {
          await handleTempVoiceSelect(interaction);
        } catch (error) {
          console.error('Temp Voice select interaction failed:', error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '處理語音房操作失敗，請稍後再試。', ephemeral: true });
          }
        }
        return;
      }

      if (interaction.customId === 'role_select_menu') {
        await handleRoleSelectMenuV2(interaction);
      }
      return;
    }

    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith(AI_LAYOUT_CANCEL_PREFIX) || interaction.customId.startsWith(PERM_REPAIR_CANCEL_PREFIX)) {
      const prefix = interaction.customId.startsWith(AI_LAYOUT_CANCEL_PREFIX) ? AI_LAYOUT_CANCEL_PREFIX : PERM_REPAIR_CANCEL_PREFIX;
      const planId = interaction.customId.slice(prefix.length);
      const plan = getLayoutRepairPlan(planId);
      if (!plan) {
        await interaction.reply({ content: '這個修復計畫已失效，請重新執行指令。', ephemeral: true });
        return;
      }
      if (interaction.user.id !== plan.requestedById) {
        await interaction.reply({ content: '只有原本建立計畫的管理員可以取消。', ephemeral: true });
        return;
      }
      deleteLayoutRepairPlan(planId);
      await interaction.update({ content: '已取消，不會修改伺服器。', embeds: [], components: [] });
      return;
    }

    if (interaction.customId.startsWith(AI_LAYOUT_CONFIRM_PREFIX) || interaction.customId.startsWith(PERM_REPAIR_CONFIRM_PREFIX)) {
      const prefix = interaction.customId.startsWith(AI_LAYOUT_CONFIRM_PREFIX) ? AI_LAYOUT_CONFIRM_PREFIX : PERM_REPAIR_CONFIRM_PREFIX;
      const planId = interaction.customId.slice(prefix.length);
      const plan = getLayoutRepairPlan(planId);
      if (!plan) {
        await interaction.reply({ content: '這個修復計畫已失效，請重新執行指令。', ephemeral: true });
        return;
      }
      if (interaction.user.id !== plan.requestedById) {
        await interaction.reply({ content: '只有原本建立計畫的管理員可以確認執行。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能執行修復。', ephemeral: true });
        return;
      }
      await interaction.update({ content: '正在執行 layout 修復，請稍候...', embeds: [], components: [] });
      try {
        const summary = await executeLayoutRepairPlan(interaction.guild, plan, {
          allowDelete: plan.deleteConfirmText === 'DELETE CONFIRM'
        });
        deleteLayoutRepairPlan(planId);
        const resultPlan = {
          ...plan,
          mode: 'execute result',
          actions: [
            ...summary.created.map((name) => ({ action: 'create_channel', targetName: name, reason: '已建立' })),
            ...summary.permissions.map((name) => ({ action: 'sync_permission', targetName: name, reason: '已修權限' })),
            ...summary.renamed.map((name) => ({ action: 'rename', targetName: name, reason: '已改名' })),
            ...summary.moved.map((name) => ({ action: 'move', targetName: name, reason: '已搬移' })),
            ...summary.archived.map((name) => ({ action: 'archive', targetName: name, reason: '已封存' })),
            ...summary.deleted.map((name) => ({ action: 'delete', targetName: name, reason: '已刪除', risk: 'high' })),
            ...summary.skipped.map((name) => ({ action: 'keep', targetName: name, reason: '已略過' }))
          ]
        };
        await interaction.editReply({
          content: summary.failed.length ? `完成，但有 ${summary.failed.length} 個失敗項目。` : 'Layout 修復完成。',
          embeds: [buildLayoutRepairEmbed(resultPlan, '✅ Layout Repair Result')],
          components: []
        });
      } catch (error) {
        console.error('Layout repair execute failed:', error);
        await interaction.editReply({ content: `Layout 修復失敗：${error.message}`, embeds: [], components: [] });
      }
      return;
    }

    if (interaction.customId.startsWith(DEDUPE_CANCEL_PREFIX)) {
      const planId = interaction.customId.slice(DEDUPE_CANCEL_PREFIX.length);
      const plan = getDedupePlan(planId);
      if (!plan) {
        await interaction.reply({ content: '這個 dedupe 計畫已失效，請重新執行 `/dedupe-layout`。', ephemeral: true });
        return;
      }
      if (interaction.user.id !== plan.requestedById) {
        await interaction.reply({ content: '只有原本執行 `/dedupe-layout` 的人可以取消。', ephemeral: true });
        return;
      }
      deleteDedupePlan(planId);
      await interaction.update({ content: '已取消，不會移動任何頻道。', embeds: [], components: [] });
      return;
    }

    if (interaction.customId.startsWith(DEDUPE_CONFIRM_PREFIX)) {
      const planId = interaction.customId.slice(DEDUPE_CONFIRM_PREFIX.length);
      const plan = getDedupePlan(planId);
      if (!plan) {
        await interaction.reply({ content: '這個 dedupe 計畫已失效，請重新執行 `/dedupe-layout`。', ephemeral: true });
        return;
      }
      if (interaction.user.id !== plan.requestedById) {
        await interaction.reply({ content: '只有原本執行 `/dedupe-layout` 的人可以確認。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能執行 dedupe。', ephemeral: true });
        return;
      }

      await interaction.update({ content: '正在封存重複項目，不會刪除頻道...', embeds: [], components: [] });
      try {
        const summary = await executeDedupePlan(interaction.guild, plan);
        deleteDedupePlan(planId);
        await interaction.editReply({ content: '', embeds: [buildSummaryEmbed('🧹 Dedupe Layout Completed', summary)], components: [] });
      } catch (error) {
        console.error('Dedupe layout failed:', error);
        await interaction.editReply({ content: `Dedupe 執行失敗：${error.message}`, embeds: [], components: [] });
      }
      return;
    }

    if (interaction.customId.startsWith('game_suggest_')) {
      try {
        await handleGameSuggestionButton(interaction);
      } catch (error) {
        console.error('Game suggestion button failed:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '處理遊戲提議按鈕時發生錯誤。', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.customId.startsWith('community_architect_cancel_')) {
      const planId = interaction.customId.replace('community_architect_cancel_', '');
      const plan = getCommunityArchitectPlan(interaction.guild.id, planId);
      if (!plan) {
        await interaction.reply({ content: '這個 Community Architect 計畫已失效，請重新執行 `/community-architect mode:preview`。', ephemeral: true });
        return;
      }
      if (plan.createdBy !== interaction.user.id) {
        await interaction.reply({ content: '只有原本產生計畫的人可以取消。', ephemeral: true });
        return;
      }
      deleteCommunityArchitectPlan(interaction.guild.id, planId);
      await interaction.update({ content: '已取消 Community Architect 計畫，不做任何變更。', embeds: [], components: [] });
      return;
    }

    if (interaction.customId.startsWith('community_v3_cancel_')) {
      const planId = interaction.customId.replace('community_v3_cancel_', '');
      const plan = getV3Plan(planId);
      if (!plan || plan.createdBy !== interaction.user.id) {
        await interaction.reply({ content: '此 V3 計畫不存在，或你不是原執行者。', ephemeral: true });
        return;
      }
      deleteV3Plan(planId);
      await interaction.update({ content: '已取消 Community Architecture V3，不做任何變更。', embeds: [], components: [] });
      return;
    }

    if (interaction.customId.startsWith('community_v3_confirm_')) {
      const planId = interaction.customId.replace('community_v3_confirm_', '');
      const plan = getV3Plan(planId);
      if (!plan || plan.createdBy !== interaction.user.id) {
        await interaction.reply({ content: '此 V3 計畫不存在，或你不是原執行者。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild) ||
          !interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageGuild 與 ManageChannels 權限。', ephemeral: true });
        return;
      }
      await interaction.update({ content: '正在重建 Community Architecture V3，請稍候...', embeds: [], components: [] });
      try {
        const result = await communityRebuildService.executeV3(interaction.guild, plan, interaction.client);
        if (!result.ok) throw new Error(result.error.message);
        const summary = result.data;
        deleteV3Plan(planId);
        await interaction.editReply({
          content: [
            '✅ Community Architecture V3 重建完成',
            `建立：${summary.created.length}`,
            `更新：${summary.updated.length}`,
            `封存：${summary.archived.length}`,
            `失敗：${summary.failed.length}`,
            `驗證問題：${summary.validation?.issues?.length || 0}`
          ].join('\n'),
          components: []
        });
      } catch (error) {
        console.error('[CommunityV3] execute failed:', error);
        await interaction.editReply({ content: `⚠️ V3 重建失敗：${error.message}`, components: [] });
      }
      return;
    }

    if (interaction.customId.startsWith('community_architect_confirm_')) {
      const planId = interaction.customId.replace('community_architect_confirm_', '');
      const plan = getCommunityArchitectPlan(interaction.guild.id, planId);
      if (!plan) {
        await interaction.reply({ content: '這個 Community Architect 計畫已失效，請重新執行 `/community-architect mode:preview`。', ephemeral: true });
        return;
      }
      if (plan.createdBy !== interaction.user.id) {
        await interaction.reply({ content: '只有原本產生計畫的人可以確認執行。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能執行 Community Architect。', ephemeral: true });
        return;
      }
      await interaction.update({ content: '正在執行 Community Architect 修復，不會刪除頻道，請稍候...', embeds: [], components: [] });
      const summary = await executeCommunityArchitectPlan(interaction.guild, plan);
      deleteCommunityArchitectPlan(interaction.guild.id, planId);
      await interaction.editReply({
        content: [
          '✅ Community Architect 修復完成',
          `建立：${summary.created.length}`,
          `改名：${summary.renamed.length}`,
          `移動：${summary.moved.length}`,
          `修權限：${summary.permissions.length}`,
          `封存：${summary.archived.length}`,
          `失敗：${summary.failed.length}`
        ].join('\n'),
        embeds: [buildCommunityArchitectPreviewEmbed({ ...plan, actions: [] })],
        components: []
      });
      return;
    }

    if (interaction.customId.startsWith('game_registry_doctor_cancel_')) {
      const planId = interaction.customId.replace('game_registry_doctor_cancel_', '');
      const plan = getGameRegistryDoctorPlan(planId);
      if (!plan) {
        await interaction.reply({ content: '這個 Game Registry Doctor 計畫已失效，請重新執行 `/game-registry-doctor`。', ephemeral: true });
        return;
      }
      if (plan.requestedById !== interaction.user.id) {
        await interaction.reply({ content: '只有原本執行 `/game-registry-doctor` 的人可以取消。', ephemeral: true });
        return;
      }
      deleteGameRegistryDoctorPlan(planId);
      await interaction.update({ content: '已取消 Game Registry Doctor，不做任何變更。', embeds: [], components: [] });
      return;
    }

    if (interaction.customId.startsWith('game_registry_doctor_confirm_')) {
      const planId = interaction.customId.replace('game_registry_doctor_confirm_', '');
      const plan = getGameRegistryDoctorPlan(planId);
      if (!plan) {
        await interaction.reply({ content: '這個 Game Registry Doctor 計畫已失效，請重新執行 `/game-registry-doctor`。', ephemeral: true });
        return;
      }
      if (plan.requestedById !== interaction.user.id) {
        await interaction.reply({ content: '只有原本執行 `/game-registry-doctor` 的人可以確認。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能執行 Game Registry Doctor。', ephemeral: true });
        return;
      }
      await interaction.update({ content: '正在修復 Game Registry，請稍候...', embeds: [], components: [] });
      const summary = await executeGameRegistryDoctorPlan(interaction.guild, plan);
      deleteGameRegistryDoctorPlan(planId);
      const doneEmbed = buildGameRegistryDoctorEmbed({
        ...plan,
        actions: [
          ...summary.metadata.map((name) => ({ type: 'repair_metadata', categoryName: name })),
          ...summary.renamed.map((name) => ({ type: 'rename_child', channelName: name, newName: '已修正' })),
          ...summary.createEntries.map((name) => ({ type: 'repair_create_entry', channelName: name, displayName: '已註冊' })),
          ...summary.archived.map((name) => ({ type: 'archive_duplicate_category', categoryName: name, keepCategoryName: '已封存' }))
        ]
      }).setTitle('✅ Game Registry Doctor 修復完成');
      await interaction.editReply({
        content: `完成。失敗：${summary.failed.length}，略過：${summary.skipped.length}`,
        embeds: [doneEmbed],
        components: []
      });
      return;
    }

    if (interaction.customId.startsWith('lfg_')) {
      try {
        await handleLfgButton(interaction);
      } catch (error) {
        console.error('LFG button interaction failed:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '處理招募卡操作失敗，請稍後再試。', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.customId.startsWith('tempvoice_')) {
      try {
        await handleTempVoiceButton(interaction);
      } catch (error) {
        console.error('Temp Voice button interaction failed:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '處理語音房操作失敗，請稍後再試。', ephemeral: true });
        }
      }
      return;
    }

    if (interaction.customId.startsWith('panel_')) {
      await handlePanelButton(interaction);
      return;
    }

    const guestCleanupConfirmUserId = getPrefixedId(interaction.customId, 'guest_cleanup_confirm_');
    if (guestCleanupConfirmUserId) {
      await handleConfirmGuestCleanup(interaction, guestCleanupConfirmUserId);
      return;
    }

    const guestCleanupCancelUserId = getPrefixedId(interaction.customId, 'guest_cleanup_cancel_');
    if (guestCleanupCancelUserId) {
      await handleCancelGuestCleanup(interaction, guestCleanupCancelUserId);
      return;
    }

    const polishConfirmPlanId = getPrefixedId(interaction.customId, POLISH_CONFIRM_PREFIX);
    if (polishConfirmPlanId) {
      await handleConfirmPolish(interaction, polishConfirmPlanId);
      return;
    }

    const polishCancelPlanId = getPrefixedId(interaction.customId, POLISH_CANCEL_PREFIX);
    if (polishCancelPlanId) {
      await handleCancelPolish(interaction, polishCancelPlanId);
      return;
    }

    const rebuildConfirmPlanId = getPrefixedId(interaction.customId, REBUILD_CONFIRM_PREFIX);
    if (rebuildConfirmPlanId) {
      await handleConfirmRebuild(interaction, rebuildConfirmPlanId);
      return;
    }

    const rebuildCancelPlanId = getPrefixedId(interaction.customId, REBUILD_CANCEL_PREFIX);
    if (rebuildCancelPlanId) {
      await handleCancelRebuild(interaction, rebuildCancelPlanId);
      return;
    }

    const cleanupConfirmPlanId = getPrefixedId(interaction.customId, CLEANUP_CONFIRM_PREFIX);
    if (cleanupConfirmPlanId) {
      await handleConfirmCategoryCleanup(interaction, cleanupConfirmPlanId);
      return;
    }

    const cleanupCancelPlanId = getPrefixedId(interaction.customId, CLEANUP_CANCEL_PREFIX);
    if (cleanupCancelPlanId) {
      await handleCancelCategoryCleanup(interaction, cleanupCancelPlanId);
      return;
    }

    const rolePermConfirmPlanId = getPrefixedId(interaction.customId, ROLEPERM_CONFIRM_PREFIX);
    if (rolePermConfirmPlanId) {
      await handleConfirmRolePermissions(interaction, rolePermConfirmPlanId);
      return;
    }

    const rolePermCancelPlanId = getPrefixedId(interaction.customId, ROLEPERM_CANCEL_PREFIX);
    if (rolePermCancelPlanId) {
      await handleCancelRolePermissions(interaction, rolePermCancelPlanId);
      return;
    }

    const factoryResetConfirmPlanId = getPrefixedId(interaction.customId, FACTORY_RESET_CONFIRM_PREFIX);
    if (factoryResetConfirmPlanId) {
      await handleConfirmFactoryReset(interaction, factoryResetConfirmPlanId);
      return;
    }

    const factoryResetCancelPlanId = getPrefixedId(interaction.customId, FACTORY_RESET_CANCEL_PREFIX);
    if (factoryResetCancelPlanId) {
      await handleCancelFactoryReset(interaction, factoryResetCancelPlanId);
      return;
    }

    const aiReorganizeConfirmPlanId = getPrefixedId(interaction.customId, AI_REORGANIZE_CONFIRM_PREFIX);
    if (aiReorganizeConfirmPlanId) {
      await handleConfirmAiReorganize(interaction, aiReorganizeConfirmPlanId);
      return;
    }

    const aiReorganizeCancelPlanId = getPrefixedId(interaction.customId, AI_REORGANIZE_CANCEL_PREFIX);
    if (aiReorganizeCancelPlanId) {
      await handleCancelAiReorganize(interaction, aiReorganizeCancelPlanId);
      return;
    }

    const restoreActiveConfirmPlanId = getPrefixedId(interaction.customId, RESTORE_ACTIVE_CONFIRM_PREFIX);
    if (restoreActiveConfirmPlanId) {
      await handleConfirmRestoreActiveChannels(interaction, restoreActiveConfirmPlanId);
      return;
    }

    const restoreActiveCancelPlanId = getPrefixedId(interaction.customId, RESTORE_ACTIVE_CANCEL_PREFIX);
    if (restoreActiveCancelPlanId) {
      await handleCancelRestoreActiveChannels(interaction, restoreActiveCancelPlanId);
      return;
    }

    if (interaction.customId === CREATE_TICKET_BUTTON_ID) {
      await handleCreateTicket(interaction);
      return;
    }

    if (interaction.customId === CLOSE_TICKET_BUTTON_ID) {
      await handleCloseTicket(interaction);
      return;
    }

    if (interaction.customId === CONFIRM_CLOSE_BUTTON_ID) {
      await handleConfirmClose(interaction);
      return;
    }

    if (interaction.customId === CANCEL_CLOSE_BUTTON_ID) {
      await handleCancelClose(interaction);
      return;
    }

    const confirmAutoOrganizePlanId = getAutoOrganizePlanId(
      interaction.customId,
      CONFIRM_AUTO_ORGANIZE_PREFIX
    );
    if (confirmAutoOrganizePlanId) {
      await handleConfirmAutoOrganize(interaction, confirmAutoOrganizePlanId);
      return;
    }

    const cancelAutoOrganizePlanId = getAutoOrganizePlanId(
      interaction.customId,
      CANCEL_AUTO_ORGANIZE_PREFIX
    );
    if (cancelAutoOrganizePlanId) {
      await handleCancelAutoOrganize(interaction, cancelAutoOrganizePlanId);
      return;
    }

    const confirmDeepCleanupPlanId = getDeepCleanupPlanId(
      interaction.customId,
      CONFIRM_DEEP_CLEANUP_PREFIX
    );
    if (confirmDeepCleanupPlanId) {
      await handleConfirmDeepCleanup(interaction, confirmDeepCleanupPlanId);
      return;
    }

    const cancelDeepCleanupPlanId = getDeepCleanupPlanId(
      interaction.customId,
      CANCEL_DEEP_CLEANUP_PREFIX
    );
    if (cancelDeepCleanupPlanId) {
      await handleCancelDeepCleanup(interaction, cancelDeepCleanupPlanId);
    }
  }
};
