const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const OpenAI = require('openai');
const accessConfig = require('../../config/roleChannelAccess');
const { cleanupEmptyCategories } = require('../../systems/categoryCleaner');
const { isCreateVoiceChannel } = require('../../systems/gameChannels');
const { isTempVoice } = require('../../systems/tempVoice');
const {
  inferActiveChannelTarget,
  isActiveProtectedChannel
} = require('../../systems/activeChannelProtector');

const pendingAiReorganizePlans = new Map();
const MAX_DELETE_CHANNELS = 30;
const ADMIN_CATEGORY = '🔒｜管理員後台';
const ARCHIVE_CATEGORY = '📦｜舊頻道封存';

const TARGET_STRUCTURE = [
  {
    name: '📌｜社群入口',
    public: true,
    channels: [
      text('📜｜社群規則', ['社群規則', '規則', 'rules']),
      text('📢｜公告', ['公告', 'announcement']),
      text('✅｜身分組領取', ['身分組領取', '身分組', 'roles']),
      text('👋｜新人報到', ['新人報到', 'welcome', '報到']),
      text('🧭｜伺服器導覽', ['伺服器導覽', '導覽'])
    ]
  },
  {
    name: '💬｜公開大廳',
    public: true,
    channels: [
      text('💬｜一般聊天', ['一般聊天', '聊天', '閒聊', 'general']),
      text('🎮｜找隊友大廳', ['找隊友大廳']),
      text('🌙｜深夜聊天', ['深夜聊天', '夜聊']),
      text('🧠｜認真討論', ['認真討論', '閒聊討論'])
    ]
  },
  gameCategory('🎮｜聯盟戰棋', [
    text('💬｜tft-聊天', ['tft-聊天']),
    text('🧑‍🤝‍🧑｜tft-找隊友', ['tft-找隊友']),
    text('🏆｜tft-戰績分享', ['tft-戰績分享']),
    text('📌｜tft-資訊', ['tft-資訊']),
    voice('➕｜建立聯盟戰棋語音', ['建立聯盟戰棋語音'])
  ]),
  gameCategory('🎮｜APEX', [
    text('💬｜apex-聊天', ['apex-聊天']),
    text('🧑‍🤝‍🧑｜apex-找隊友', ['apex-找隊友']),
    text('🏆｜apex-戰績分享', ['apex-戰績分享']),
    text('📌｜apex-資訊', ['apex-資訊']),
    voice('➕｜建立APEX語音', ['建立APEX語音'])
  ]),
  gameCategory('🎮｜特戰英豪', [
    text('💬｜特戰-聊天', ['特戰-聊天']),
    text('🧑‍🤝‍🧑｜特戰-找隊友', ['特戰-找隊友']),
    text('🏆｜特戰-戰績分享', ['特戰-戰績分享']),
    text('📌｜特戰-資訊', ['特戰-資訊']),
    voice('➕｜建立特戰語音', ['建立特戰語音', '建立特戰英豪語音'])
  ]),
  gameCategory('🎮｜LOL', [
    text('💬｜lol-聊天', ['lol-聊天']),
    text('🧑‍🤝‍🧑｜lol-找隊友', ['lol-找隊友']),
    text('🏆｜lol-戰績分享', ['lol-戰績分享']),
    text('📌｜lol-資訊', ['lol-資訊']),
    voice('➕｜建立LOL語音', ['建立LOL語音'])
  ]),
  gameCategory('🎮｜Minecraft', [
    text('💬｜mc-聊天', ['mc-聊天']),
    text('🧑‍🤝‍🧑｜mc-找隊友', ['mc-找隊友']),
    text('🏗｜mc-建築分享', ['mc-建築分享', 'mc-戰績分享']),
    text('📌｜mc-伺服器資訊', ['mc-伺服器資訊', 'mc-資訊']),
    voice('➕｜建立MC語音', ['建立MC語音', '建立Minecraft語音'])
  ]),
  {
    name: '🛠｜創作與開發',
    roleName: '🛠 開發/AI',
    channels: [
      text('🧑‍💻｜程式開發', ['程式開發', '程式', '開發']),
      text('🤖｜AI工具', ['AI工具', 'ai-tools']),
      text('🎨｜設計作品', ['設計作品']),
      text('📁｜作品展示', ['作品展示']),
      text('🧪｜專案測試', ['專案測試'])
    ]
  },
  {
    name: '📈｜投資討論',
    roleName: '📈 股票投資',
    channels: [
      text('📊｜台股討論', ['台股討論', '台股']),
      text('📈｜盤勢觀察', ['盤勢觀察', '盤勢']),
      text('🧠｜投資筆記', ['投資筆記']),
      text('🤖｜股票AI工具', ['股票AI工具'])
    ]
  },
  {
    name: '🎫｜客服支援',
    public: true,
    channels: [
      text('🎟｜開啟客服單', ['開啟客服單']),
      text('🐞｜問題回報', ['問題回報']),
      text('💡｜建議區', ['建議區'])
    ]
  },
  {
    name: ADMIN_CATEGORY,
    adminOnly: true,
    channels: [
      text('🔒｜管理員頻道', ['管理員頻道']),
      text('📑｜server-logs', ['server-logs']),
      text('📑｜ticket-logs', ['ticket-logs']),
      text('🧹｜整理紀錄', ['整理紀錄']),
      text('⚙️｜bot-control', ['bot-control'])
    ]
  },
  {
    name: ARCHIVE_CATEGORY,
    archive: true,
    channels: []
  }
];

function text(name, aliases = []) {
  return { name, type: ChannelType.GuildText, aliases };
}

function voice(name, aliases = []) {
  return { name, type: ChannelType.GuildVoice, aliases, userLimit: 1 };
}

function gameCategory(name, channels) {
  return { name, roleName: '🎮 遊戲玩家', channels };
}

function normalizeName(name) {
  return String(name || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function matchesName(channel, spec) {
  const names = [spec.name, ...(spec.aliases || [])];
  return names.some((name) => channel.name === name || normalizeName(channel.name) === normalizeName(name));
}

function getAllTargetNames() {
  const names = new Set(TARGET_STRUCTURE.map((category) => normalizeName(category.name)));
  for (const category of TARGET_STRUCTURE) {
    for (const channel of category.channels) {
      names.add(normalizeName(channel.name));
      for (const alias of channel.aliases || []) names.add(normalizeName(alias));
    }
  }
  return names;
}

function findCategory(guild, name) {
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);
}

function findChannel(guild, spec) {
  return guild.channels.cache.find((channel) => channel.type === spec.type && matchesName(channel, spec));
}

function isProtectedChannel(channel, options) {
  if (!channel) return '頻道不存在';
  if (channel.id === options.sourceChannelId) return '正在執行指令的頻道';
  if (channel.guild.systemChannelId === channel.id) return 'Discord 系統頻道';
  if (channel.guild.rulesChannelId === channel.id) return 'Discord 社群規則頻道';
  if (channel.name.startsWith('ticket-')) return 'ticket 私人頻道';
  if (isCreateVoiceChannel(channel)) return '建立語音觸發頻道';
  if (channel.type === ChannelType.GuildVoice && isTempVoice(channel.guild.id, channel.id)) return '臨時語音頻道';
  if (isActiveProtectedChannel(channel)) return '有效生活/遊戲頻道，不封存不刪除';
  return null;
}

function findRole(guild, name) {
  return guild.roles.cache.find((role) => role.name === name) || null;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

async function getAiSuggestions(guild, plan, useAi) {
  if (!useAi || !process.env.OPENAI_API_KEY) {
    return {
      enabled: false,
      skippedReason: useAi ? '未設定 OPENAI_API_KEY，因此略過 AI 建議。' : 'use_ai=false，略過 AI 建議。',
      suggestions: []
    };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const snapshot = {
      guildName: guild.name,
      categories: [...guild.channels.cache.values()]
        .filter((channel) => channel.type === ChannelType.GuildCategory)
        .map((channel) => channel.name),
      channels: [...guild.channels.cache.values()]
        .filter((channel) => channel.type !== ChannelType.GuildCategory)
        .slice(0, 80)
        .map((channel) => ({
          name: channel.name,
          type: channel.type === ChannelType.GuildVoice ? 'voice' : 'text',
          currentCategory: channel.parent?.name || '未分類'
        })),
      targetCategories: TARGET_STRUCTURE.map((category) => category.name)
    };

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是 Discord 伺服器整理顧問。請用繁體中文回覆純 JSON。' +
            '你只能提出整理建議，不能要求直接刪除、不能改名、不能處理 ticket- 頻道。' +
            '低信心項目請建議封存，不要建議刪除。格式：{"suggestions":[{"channelName":"xxx","suggestedCategory":"xxx","confidence":"high|medium|low","reason":"xxx"}]}'
        },
        { role: 'user', content: JSON.stringify(snapshot) }
      ]
    });

    const content = completion.choices[0]?.message?.content || '{"suggestions":[]}';
    const parsed = JSON.parse(content);
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

    return {
      enabled: true,
      skippedReason: '',
      suggestions: suggestions.slice(0, 20).map((item) => ({
        channelName: String(item.channelName || '').slice(0, 100),
        suggestedCategory: String(item.suggestedCategory || '').slice(0, 100),
        confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'low',
        reason: String(item.reason || '').slice(0, 250)
      })).filter((item) => (
        item.channelName &&
        !item.channelName.startsWith('ticket-') &&
        !(item.confidence === 'low' && isActiveProtectedChannel(item.channelName))
      ))
    };
  } catch (error) {
    return {
      enabled: true,
      skippedReason: `AI 建議暫時失敗：${error.message}`,
      suggestions: []
    };
  }
}

async function createAiReorganizePlan(guild, options) {
  const existingCategories = new Set(
    [...guild.channels.cache.values()]
      .filter((channel) => channel.type === ChannelType.GuildCategory)
      .map((category) => category.name)
  );
  const targetNames = getAllTargetNames();
  const categoriesToCreate = TARGET_STRUCTURE
    .filter((category) => !existingCategories.has(category.name))
    .map((category) => category.name);
  const channelsToCreate = [];
  const channelsToMove = [];
  const publicChannels = [];
  const rolePermissionCategories = [];
  const oldChannels = [];
  const protectedChannels = [];

  for (const category of TARGET_STRUCTURE) {
    const existingCategory = findCategory(guild, category.name);
    const categoryIsPublic = category.public && (category.name !== '💬｜公開大廳' || options.publicChat);
    if (categoryIsPublic) publicChannels.push(category.name);
    if (category.roleName || category.adminOnly || category.archive) {
      rolePermissionCategories.push({
        categoryName: category.name,
        roleName: category.roleName || (category.adminOnly ? '站長 / 管理員' : '封存隱藏')
      });
    }

    for (const channelSpec of category.channels) {
      const existingChannel = findChannel(guild, channelSpec);
      if (!existingChannel) {
        channelsToCreate.push({
          categoryName: category.name,
          channelName: channelSpec.name,
          type: channelSpec.type === ChannelType.GuildVoice ? 'voice' : 'text'
        });
      } else if (!existingCategory || existingChannel.parentId !== existingCategory.id) {
        channelsToMove.push({
          channelId: existingChannel.id,
          channelName: existingChannel.name,
          fromCategoryName: existingChannel.parent?.name || '未分類',
          toCategoryName: category.name
        });
      }
    }
  }

  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory) continue;
    if (targetNames.has(normalizeName(channel.name))) continue;

    const activeTarget = inferActiveChannelTarget(channel);
    if (activeTarget) {
      channelsToMove.push({
        channelId: channel.id,
        channelName: channel.name,
        fromCategoryName: channel.parent?.name || '未分類',
        toCategoryName: activeTarget.categoryName,
        reason: activeTarget.reason
      });
      continue;
    }

    const protectedReason = isProtectedChannel(channel, options);
    if (protectedReason) {
      protectedChannels.push({ channelId: channel.id, channelName: channel.name, reason: protectedReason });
      continue;
    }

    oldChannels.push({
      channelId: channel.id,
      channelName: channel.name,
      currentCategoryName: channel.parent?.name || '未分類',
      action: options.oldChannels === 'delete' ? 'delete' : 'archive'
    });
  }

  const deleteCandidates = options.oldChannels === 'delete'
    ? oldChannels.slice(0, MAX_DELETE_CHANNELS)
    : [];
  const ai = await getAiSuggestions(guild, { oldChannels }, options.useAi);

  return {
    guildId: guild.id,
    requestedById: options.requestedById,
    sourceChannelId: options.sourceChannelId,
    mode: options.mode,
    useAi: options.useAi,
    oldChannelsMode: options.oldChannels,
    publicChat: options.publicChat,
    createdAt: Date.now(),
    categoriesToCreate,
    channelsToCreate,
    channelsToMove,
    publicChannels,
    rolePermissionCategories,
    oldChannels,
    deleteCandidates,
    protectedChannels,
    ai,
    riskNotes: [
      'preview 絕不修改伺服器。',
      'execute 仍需按鈕二次確認。',
      '一般聊天與公開大廳會開放 @everyone 可看可發言。',
      '遊戲、投資、開發分類會改成身分組解鎖。',
      '管理員後台與封存區會對 @everyone 隱藏。',
      'delete 模式最多刪除 30 個頻道，且會避開 ticket、臨時語音、系統頻道與執行指令頻道。'
    ]
  };
}

function saveAiReorganizePlan(id, plan) {
  pendingAiReorganizePlans.set(id, plan);
}

function getAiReorganizePlan(id) {
  return pendingAiReorganizePlans.get(id);
}

function deleteAiReorganizePlan(id) {
  pendingAiReorganizePlans.delete(id);
}

async function getOrCreateCategory(guild, name, summary) {
  const existing = findCategory(guild, name);
  if (existing) return existing;

  const category = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    reason: 'AI server reorganize category setup'
  });
  summary.createdCategories.push(category.name);
  return category;
}

async function getOrCreateRole(guild, name, summary) {
  let role = findRole(guild, name);
  if (role) return role;

  role = await guild.roles.create({
    name,
    reason: 'AI server reorganize role access setup'
  });
  summary.createdRoles.push(role.name);
  return role;
}

async function getOrCreateLogChannel(guild, summary) {
  const adminCategory = await getOrCreateCategory(guild, ADMIN_CATEGORY, summary);
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && ['server-logs', '📑｜server-logs'].includes(item.name)
  );
  if (channel) {
    if (channel.parentId !== adminCategory.id) {
      await channel.setParent(adminCategory.id, { lockPermissions: false, reason: 'Move logs to admin backend' });
    }
    return channel;
  }

  channel = await guild.channels.create({
    name: '📑｜server-logs',
    type: ChannelType.GuildText,
    parent: adminCategory.id,
    reason: 'AI server reorganize log channel setup'
  });
  summary.createdChannels.push(channel.name);
  return channel;
}

function getTargetSpecByCategory() {
  return TARGET_STRUCTURE.map((category) => ({
    ...category,
    channels: category.channels.map((channel) => ({ ...channel }))
  }));
}

async function createOrMoveTargetStructure(guild, summary) {
  const categoryMap = new Map();

  for (const categorySpec of getTargetSpecByCategory()) {
    const category = await getOrCreateCategory(guild, categorySpec.name, summary);
    categoryMap.set(categorySpec.name, category);

    const orderedChannels = [];
    for (const channelSpec of categorySpec.channels) {
      let channel = findChannel(guild, channelSpec);
      if (!channel) {
        channel = await guild.channels.create({
          name: channelSpec.name,
          type: channelSpec.type,
          parent: category.id,
          userLimit: channelSpec.userLimit,
          reason: 'AI server reorganize channel setup'
        });
        summary.createdChannels.push(channel.name);
      } else if (channel.parentId !== category.id) {
        await channel.setParent(category.id, {
          lockPermissions: false,
          reason: 'AI server reorganize move channel to target category'
        });
        summary.movedChannels.push(`${channel.name} -> ${category.name}`);
      }
      orderedChannels.push(channel);
    }

    for (let index = 0; index < orderedChannels.length; index += 1) {
      try {
        await orderedChannels[index].setPosition(index, { reason: 'AI server reorganize channel ordering' });
      } catch (error) {
        summary.failed.push(`排序失敗：${orderedChannels[index].name} (${error.message})`);
      }
    }
  }

  return categoryMap;
}

function buildAdminOverwrites(guild, adminRoles) {
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.Connect
      ]
    }
  ];

  for (const role of adminRoles.filter(Boolean)) {
    overwrites.push({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.Connect
      ]
    });
  }
  return overwrites;
}

async function syncCategoryChildren(guild, category, summary) {
  const children = [...guild.channels.cache.values()].filter((channel) => channel.parentId === category.id);
  for (const child of children) {
    if (child.name.startsWith('ticket-')) {
      summary.skipped.push(`${child.name}：ticket 頻道不同步`);
      continue;
    }
    if (child.type === ChannelType.GuildVoice && isTempVoice(guild.id, child.id)) {
      summary.skipped.push(`${child.name}：臨時語音不同步`);
      continue;
    }
    try {
      await child.lockPermissions();
      summary.syncedChannels.push(child.name);
    } catch (error) {
      summary.failed.push(`同步權限失敗：${child.name} (${error.message})`);
    }
  }
}

async function applyTargetPermissions(guild, categoryMap, summary, plan) {
  const roles = {};
  for (const roleName of unique([
    ...accessConfig.adminRoles,
    ...accessConfig.roleAccess.map((rule) => rule.roleName)
  ])) {
    roles[roleName] = await getOrCreateRole(guild, roleName, summary);
  }
  const adminRoles = accessConfig.adminRoles.map((name) => roles[name]).filter(Boolean);

  for (const categorySpec of TARGET_STRUCTURE) {
    const category = categoryMap.get(categorySpec.name) || findCategory(guild, categorySpec.name);
    if (!category) continue;

    let overwrites;
    const categoryIsPublic = categorySpec.public && (categorySpec.name !== '💬｜公開大廳' || plan.publicChat);
    if (categoryIsPublic) {
      overwrites = [
        {
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.Connect
          ]
        },
        {
          id: guild.members.me.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect
          ]
        },
        ...buildAdminOverwrites(guild, adminRoles).filter((overwrite) => overwrite.id !== guild.roles.everyone.id)
      ];
    } else if (categorySpec.adminOnly || categorySpec.archive) {
      overwrites = buildAdminOverwrites(guild, adminRoles);
    } else {
      const role = categorySpec.roleName ? roles[categorySpec.roleName] : null;
      overwrites = [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: guild.members.me.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect
          ]
        },
        ...buildAdminOverwrites(guild, adminRoles).filter((overwrite) => overwrite.id !== guild.roles.everyone.id),
        role ? {
          id: role.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.Connect
          ]
        } : null
      ].filter(Boolean);
    }

    try {
      await category.permissionOverwrites.set(overwrites, 'AI server reorganize role based visibility');
      summary.updatedPermissions.push(category.name);
      await syncCategoryChildren(guild, category, summary);
    } catch (error) {
      summary.failed.push(`套用權限失敗：${category.name} (${error.message})`);
    }
  }
}

async function archiveOrDeleteOldChannels(guild, plan, summary) {
  const archive = findCategory(guild, ARCHIVE_CATEGORY) || await getOrCreateCategory(guild, ARCHIVE_CATEGORY, summary);

  if (plan.oldChannelsMode === 'delete') {
    for (const item of plan.deleteCandidates.slice(0, MAX_DELETE_CHANNELS)) {
      const channel = guild.channels.cache.get(item.channelId);
      if (!channel) continue;
      const protectedReason = isProtectedChannel(channel, plan);
      if (protectedReason) {
        summary.skipped.push(`${channel.name}：${protectedReason}`);
        continue;
      }

      try {
        await channel.setName(`delete-pending-${channel.name}`.slice(0, 90), 'AI reorganize delete pending');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await channel.delete('AI server reorganize old channel delete confirmed');
        summary.deletedChannels.push(item.channelName);
      } catch (error) {
        summary.failed.push(`刪除失敗：${item.channelName} (${error.message})`);
      }
    }
  }

  const archivedTargets = plan.oldChannelsMode === 'delete'
    ? plan.oldChannels.filter((item) => !plan.deleteCandidates.some((candidate) => candidate.channelId === item.channelId))
    : plan.oldChannels;

  for (const item of archivedTargets) {
    const channel = guild.channels.cache.get(item.channelId);
    if (!channel) continue;
    const protectedReason = isProtectedChannel(channel, plan);
    if (protectedReason) {
      summary.skipped.push(`${channel.name}：${protectedReason}`);
      continue;
    }

    try {
      await channel.setParent(archive.id, {
        lockPermissions: false,
        reason: 'AI server reorganize old channel archive'
      });
      summary.archivedChannels.push(channel.name);
    } catch (error) {
      summary.failed.push(`封存失敗：${item.channelName} (${error.message})`);
    }
  }
}

async function executeAiReorganize(interaction, plan) {
  const guild = interaction.guild;
  const summary = {
    createdCategories: [],
    createdChannels: [],
    createdRoles: [],
    movedChannels: [],
    archivedChannels: [],
    deletedChannels: [],
    updatedPermissions: [],
    syncedChannels: [],
    skipped: [],
    failed: [],
    categoryCleanup: null
  };

  const logChannel = await getOrCreateLogChannel(guild, summary);
  const categoryMap = await createOrMoveTargetStructure(guild, summary);
  await applyTargetPermissions(guild, categoryMap, summary, plan);
  await archiveOrDeleteOldChannels(guild, plan, summary);

  try {
    summary.categoryCleanup = await cleanupEmptyCategories(guild, {
      deleteLevel: plan.oldChannelsMode === 'delete' ? 'normal' : 'safe'
    });
  } catch (error) {
    summary.failed.push(`空分類清理失敗：${error.message}`);
  }

  try {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('AI 伺服器重整完成')
      .setDescription(`執行者：${interaction.user}\nold_channels：${plan.oldChannelsMode}`)
      .addFields(
        { name: '建立分類', value: summary.createdCategories.slice(0, 15).join('\n') || '無' },
        { name: '建立頻道', value: summary.createdChannels.slice(0, 15).join('\n') || '無' },
        { name: '移動頻道', value: summary.movedChannels.slice(0, 15).join('\n') || '無' },
        { name: '封存/刪除', value: `封存 ${summary.archivedChannels.length} 個\n刪除 ${summary.deletedChannels.length} 個` },
        { name: '權限', value: summary.updatedPermissions.slice(0, 15).join('\n') || '無' },
        { name: '失敗/略過', value: [...summary.failed, ...summary.skipped].slice(0, 15).join('\n') || '無' }
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    summary.failed.push(`寫入 server-logs 失敗：${error.message}`);
  }

  return summary;
}

module.exports = {
  ARCHIVE_CATEGORY,
  ADMIN_CATEGORY,
  TARGET_STRUCTURE,
  createAiReorganizePlan,
  deleteAiReorganizePlan,
  executeAiReorganize,
  getAiReorganizePlan,
  saveAiReorganizePlan
};
