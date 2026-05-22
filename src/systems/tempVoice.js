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
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { findGameCategory, findOrCreateGameCategory, getGameNameFromCreateVoice, isCreateVoiceChannel } = require('./gameChannels');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TEMP_VOICE_FILE = path.join(DATA_DIR, 'temp-voice.json');
const TEMP_VOICE_SETTINGS_FILE = path.join(DATA_DIR, 'tempvoice-settings.json');
const pendingDeletes = new Map();

const DEFAULT_SETTINGS = {
  autoTransfer: true,
  autoDeleteSeconds: 30,
  createControlPanel: true,
  createActivityMessage: true,
  cleanupMode: 'disable_panel'
};

function ensureFile(filePath, fallback = '{}') {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback, 'utf8');
}

function readJsonFile(filePath) {
  ensureFile(filePath);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`讀取 ${path.basename(filePath)} 失敗：`, error);
    return {};
  }
}

function writeJsonFile(filePath, data) {
  ensureFile(filePath);
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error(`寫入 ${path.basename(filePath)} 失敗：`, error);
  }
}

function readTempVoice() {
  return readJsonFile(TEMP_VOICE_FILE);
}

function writeTempVoice(data) {
  writeJsonFile(TEMP_VOICE_FILE, data);
}

function getTempVoiceRecord(guildId, channelId) {
  const data = readTempVoice();
  return data[guildId]?.[channelId] || null;
}

function updateTempVoiceRecord(guildId, channelId, patch) {
  const data = readTempVoice();
  if (!data[guildId] || !data[guildId][channelId]) return null;
  data[guildId][channelId] = {
    ...data[guildId][channelId],
    ...patch
  };
  writeTempVoice(data);
  return data[guildId][channelId];
}

function addTempVoice(guildId, channelId, metadata) {
  const data = readTempVoice();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = {
    ownerId: metadata.ownerId,
    game: metadata.game,
    createdAt: new Date().toISOString(),
    voiceChannelId: channelId,
    voiceChannelName: metadata.voiceChannelName || null,
    roomName: metadata.roomName || metadata.voiceChannelName || null,
    locked: Boolean(metadata.locked),
    userLimit: metadata.userLimit || 5,
    linkedTextChannelId: metadata.linkedTextChannelId || null,
    textControlChannelId: metadata.textControlChannelId || metadata.linkedTextChannelId || null,
    controlMessageId: metadata.controlMessageId || null,
    activityMessageId: metadata.activityMessageId || null
  };
  writeTempVoice(data);
}

function removeTempVoice(guildId, channelId) {
  const data = readTempVoice();
  if (!data[guildId] || !data[guildId][channelId]) return false;
  delete data[guildId][channelId];
  writeTempVoice(data);
  return true;
}

function isTempVoice(guildId, channelId) {
  return Boolean(getTempVoiceRecord(guildId, channelId));
}

function readTempVoiceSettings() {
  return readJsonFile(TEMP_VOICE_SETTINGS_FILE);
}

function getTempVoiceSettings(guildId) {
  const data = readTempVoiceSettings();
  return {
    ...DEFAULT_SETTINGS,
    ...(data[guildId] || {})
  };
}

function updateTempVoiceSettings(guildId, patch) {
  const data = readTempVoiceSettings();
  data[guildId] = {
    ...DEFAULT_SETTINGS,
    ...(data[guildId] || {}),
    ...patch
  };
  writeJsonFile(TEMP_VOICE_SETTINGS_FILE, data);
  return data[guildId];
}

function safeVoiceName(value) {
  return String(value || '')
    .trim()
    .replace(/@everyone|@here/gi, '')
    .replace(/discord\.gg\/?\S*/gi, '')
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\- ]+/gu, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

function canControlTempVoice(interaction, record) {
  return (
    interaction.user.id === record.ownerId ||
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
  );
}

function getCreateVoiceGame(channel) {
  if (!isCreateVoiceChannel(channel)) return null;
  return getGameNameFromCreateVoice(channel.name);
}

function findActivityChannel(guild) {
  const names = ['💬｜一般聊天', '🎮｜找隊友大廳', '一般聊天', '找隊友大廳'];
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildText &&
    names.some((name) => channel.name === name || channel.name.includes(name.replace(/[💬🎮｜]/g, '')))
  )) || null;
}

function buildControlRows(channelId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tempvoice_lock_${channelId}`)
        .setLabel('鎖房')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`tempvoice_open_${channelId}`)
        .setLabel('公開')
        .setEmoji('🌐')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`tempvoice_limit_${channelId}`)
        .setLabel('人數限制')
        .setEmoji('👥')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tempvoice_rename_${channelId}`)
        .setLabel('改名')
        .setEmoji('✏️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`tempvoice_transfer_${channelId}`)
        .setLabel('移交房主')
        .setEmoji('👑')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`tempvoice_disband_${channelId}`)
        .setLabel('解散房間')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled)
    )
  ];
}

function buildControlEmbed(channel, record) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎛 語音房控制台')
    .setDescription(
      `房間名稱：${channel.name}\n` +
      `語音房：${channel}\n` +
      `房主：<@${record.ownerId}>\n` +
      `遊戲：${record.game}\n` +
      `鎖定狀態：${record.locked ? '已鎖定' : '公開'}\n` +
      `人數限制：${record.userLimit || '無限制'}\n` +
      `建立時間：${record.createdAt ? `<t:${Math.floor(new Date(record.createdAt).getTime() / 1000)}:R>` : '未知'}`
    )
    .setTimestamp();
}

function buildTempVoiceControlPayload(channel) {
  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  if (!record) return null;
  return {
    embeds: [buildControlEmbed(channel, record)],
    components: buildControlRows(channel.id)
  };
}

function buildEndedControlEmbed(snapshot) {
  return new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle('⚫ 語音房已結束')
    .setDescription(
      `房間名稱：${snapshot.roomName || '未知'}\n` +
      `建立時間：${snapshot.createdAt ? `<t:${Math.floor(new Date(snapshot.createdAt).getTime() / 1000)}:F>` : '未知'}\n` +
      `結束時間：<t:${Math.floor(new Date(snapshot.endedAt).getTime() / 1000)}:F>\n` +
      `房主：${snapshot.ownerId ? `<@${snapshot.ownerId}>` : '未知'}\n` +
      `遊戲分類：${snapshot.game || '未知'}\n\n` +
      '此控制面板已失效。'
    )
    .setTimestamp();
}

async function fetchControlPanelMessage(guild, record) {
  if (!record.controlPanelChannelId || !record.controlPanelMessageId) return null;

  try {
    const channel = await guild.client.channels.fetch(record.controlPanelChannelId).catch(() => null);
    if (!channel || !channel.messages) return null;
    return channel.messages.fetch(record.controlPanelMessageId).catch(() => null);
  } catch (error) {
    return null;
  }
}

async function cleanupControlPanel(guild, channelId, snapshot) {
  const record = getTempVoiceRecord(guild.id, channelId);
  if (!record) return;

  const settings = getTempVoiceSettings(guild.id);
  if (settings.cleanupMode === 'keep_panel') return;

  const message = await fetchControlPanelMessage(guild, record);
  if (!message) return;

  try {
    if (settings.cleanupMode === 'delete_panel') {
      await message.delete().catch(() => null);
      return;
    }

    await message.edit({
      embeds: [buildEndedControlEmbed(snapshot)],
      components: buildControlRows(channelId, true)
    }).catch(() => null);
  } catch (error) {
    // DM/control-channel cleanup should never crash the bot.
  }
}

async function finalizeTempVoice(guild, channelId, channelSnapshot = {}) {
  const record = getTempVoiceRecord(guild.id, channelId);
  if (!record) return false;

  const snapshot = {
    createdAt: record.createdAt,
    endedAt: new Date().toISOString(),
    ownerId: record.ownerId,
    game: record.game,
    roomName: channelSnapshot.name || record.roomName || record.voiceChannelName || `voice-${channelId}`
  };

  updateTempVoiceRecord(guild.id, channelId, {
    endedAt: snapshot.endedAt,
    roomName: snapshot.roomName
  });
  await cleanupControlPanel(guild, channelId, snapshot);
  removeTempVoice(guild.id, channelId);
  return true;
}

async function getOrCreateControlChannel(guild, member) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === '🔒｜語音控制台'
  );

  if (!channel) {
    channel = await guild.channels.create({
      name: '🔒｜語音控制台',
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: guild.members.me.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ],
      reason: 'Temp voice private control panel fallback'
    });
  }

  if (member) {
    await channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      SendMessages: false,
      ReadMessageHistory: true
    }, { reason: 'Allow temp voice owner to view control panel' }).catch(() => null);
  }

  return channel;
}

async function sendActivityMessage({ guild, channel, member, record }) {
  const settings = getTempVoiceSettings(guild.id);
  if (!settings.createActivityMessage) return;

  const targetChannel = findActivityChannel(guild);
  if (!targetChannel) return;

  try {
    const limitText = record.userLimit ? `${Math.max(channel.members.size, 1)}/${record.userLimit}` : `${Math.max(channel.members.size, 1)}/無限制`;
    const activityEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🎮 語音房已建立')
      .setDescription(`🎮 ${member} 建立了 ${record.game} 語音房：${channel}\n目前人數：${limitText}\n想加入可以直接點語音房。`)
      .setTimestamp();

    const activityMessage = await targetChannel.send({ embeds: [activityEmbed] });
    updateTempVoiceRecord(guild.id, channel.id, {
      linkedTextChannelId: targetChannel.id,
      activityChannelId: targetChannel.id,
      activityMessageId: activityMessage.id
    });

    setTimeout(() => {
      activityMessage.delete().catch(() => null);
    }, 10 * 60 * 1000);
  } catch (error) {
    console.error('發送 temp voice 活動通知失敗：', error);
  }
}

async function sendOwnerControlPanel({ guild, channel, member, interaction = null }) {
  const settings = getTempVoiceSettings(guild.id);
  if (!settings.createControlPanel) return null;

  const payload = buildTempVoiceControlPayload(channel);
  if (!payload) return null;

  if (interaction) {
    return payload;
  }

  try {
    const dm = await member.send(payload);
    updateTempVoiceRecord(guild.id, channel.id, {
      controlPanelChannelId: dm.channelId || null,
      controlPanelMessageId: dm.id
    });
    return dm;
  } catch (error) {
    try {
      const controlChannel = await getOrCreateControlChannel(guild, member);
      const message = await controlChannel.send({
        content: `${member}`,
        ...payload
      });
      updateTempVoiceRecord(guild.id, channel.id, {
        controlPanelChannelId: controlChannel.id,
        controlPanelMessageId: message.id,
        textControlChannelId: controlChannel.id
      });
      return message;
    } catch (fallbackError) {
      console.error('發送 temp voice 控制台失敗：', fallbackError);
      return null;
    }
  }
}

async function createTemporaryVoice({ guild, member, game, name, limit = 5, createCategoryIfMissing = false }) {
  const category = createCategoryIfMissing
    ? await findOrCreateGameCategory(guild, game)
    : findGameCategory(guild, game);
  if (!category) {
    throw new Error(`找不到 🎮｜${game} 分類，請先使用 /setup-game 建立遊戲分區。`);
  }

  const label = safeVoiceName(name || member.user.username) || member.user.id.slice(-6);
  const userLimit = Math.max(0, Math.min(Number(limit) || 5, 99));
  const channel = await guild.channels.create({
    name: `🔊｜${game}-${label}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    userLimit,
    reason: `Temporary party voice created by ${member.user.tag}`
  });

  addTempVoice(guild.id, channel.id, {
    game,
    ownerId: member.id,
    userLimit,
    voiceChannelName: channel.name,
    roomName: channel.name
  });

  await sendActivityMessage({
    guild,
    channel,
    member,
    record: getTempVoiceRecord(guild.id, channel.id)
  });

  return channel;
}

async function scheduleTempVoiceDeletion(channel) {
  if (!channel || channel.type !== ChannelType.GuildVoice) return;
  if (!isTempVoice(channel.guild.id, channel.id)) return;
  if (pendingDeletes.has(channel.id)) return;

  const settings = getTempVoiceSettings(channel.guild.id);
  const timeout = setTimeout(async () => {
    pendingDeletes.delete(channel.id);
    try {
      const freshChannel = channel.guild.channels.cache.get(channel.id);
      if (!freshChannel || freshChannel.members.size > 0) return;
      if (!isTempVoice(channel.guild.id, channel.id)) return;
      const snapshot = { name: freshChannel.name };
      await freshChannel.delete(`Temporary voice empty for ${settings.autoDeleteSeconds} seconds`);
      await finalizeTempVoice(channel.guild, channel.id, snapshot);
    } catch (error) {
      console.error('刪除臨時語音頻道失敗：', error);
    }
  }, Math.max(5, settings.autoDeleteSeconds) * 1000);

  pendingDeletes.set(channel.id, timeout);
}

function cancelPendingDeletion(channelId) {
  const timeout = pendingDeletes.get(channelId);
  if (!timeout) return;
  clearTimeout(timeout);
  pendingDeletes.delete(channelId);
}

async function transferOwnerIfNeeded(oldState) {
  const record = getTempVoiceRecord(oldState.guild.id, oldState.channelId);
  if (!record || record.ownerId !== oldState.id) return;

  const settings = getTempVoiceSettings(oldState.guild.id);
  if (!settings.autoTransfer) return;

  const channel = oldState.guild.channels.cache.get(oldState.channelId);
  if (!channel || channel.members.size === 0) return;

  const nextOwner = channel.members.find((member) => !member.user.bot);
  if (!nextOwner) return;

  updateTempVoiceRecord(oldState.guild.id, channel.id, { ownerId: nextOwner.id });

  const textChannel = record.linkedTextChannelId
    ? oldState.guild.channels.cache.get(record.linkedTextChannelId)
    : findActivityChannel(oldState.guild);
  if (textChannel?.isTextBased()) {
    await textChannel.send(`👑 房主已自動轉移給 ${nextOwner}`).catch(() => null);
  }
}

function getTempVoiceChannelFromInteraction(interaction, channelId) {
  let channel = interaction.guild?.channels.cache.get(channelId);
  if (!channel && interaction.client?.guilds?.cache) {
    for (const guild of interaction.client.guilds.cache.values()) {
      channel = guild.channels.cache.get(channelId);
      if (channel) break;
    }
  }
  if (!channel || channel.type !== ChannelType.GuildVoice) return null;
  if (!isTempVoice(channel.guild.id, channel.id)) return null;
  return channel;
}

async function assertTempVoiceControl(interaction, channelId) {
  const channel = getTempVoiceChannelFromInteraction(interaction, channelId);
  if (!channel) {
    await interaction.reply(privateReplyPayload(interaction, { content: '此語音房已結束。' }));
    return null;
  }

  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  const guildMember = interaction.guild
    ? interaction.member
    : await channel.guild.members.fetch(interaction.user.id).catch(() => null);
  const isAdmin = Boolean(guildMember?.permissions?.has(PermissionFlagsBits.ManageChannels));
  if (!record) {
    await interaction.reply(privateReplyPayload(interaction, { content: '此語音房已結束。' }));
    return null;
  }

  if (interaction.user.id !== record.ownerId && !isAdmin) {
    await interaction.reply(privateReplyPayload(interaction, { content: '只有房主或管理員可以控制這個房間。' }));
    return null;
  }

  return { guild: channel.guild, channel, record };
}

function getChannelIdFromCustomId(customId, prefix) {
  return customId.startsWith(prefix) ? customId.slice(prefix.length) : null;
}

function privateReplyPayload(interaction, payload) {
  return interaction.guild ? { ...payload, ephemeral: true } : payload;
}

async function handleTempVoiceButton(interaction) {
  const id = interaction.customId;

  if (id.startsWith('tempvoice_lock_')) {
    const context = await assertTempVoiceControl(interaction, getChannelIdFromCustomId(id, 'tempvoice_lock_'));
    if (!context) return;
    await context.channel.permissionOverwrites.edit(context.guild.roles.everyone.id, { Connect: false }, { reason: 'Temp voice locked by owner' });
    updateTempVoiceRecord(context.guild.id, context.channel.id, { locked: true });
    await interaction.reply(privateReplyPayload(interaction, { content: '🔒 房間已鎖定。' }));
    return;
  }

  if (id.startsWith('tempvoice_open_')) {
    const context = await assertTempVoiceControl(interaction, getChannelIdFromCustomId(id, 'tempvoice_open_'));
    if (!context) return;
    await context.channel.permissionOverwrites.edit(context.guild.roles.everyone.id, { Connect: true }, { reason: 'Temp voice opened by owner' });
    updateTempVoiceRecord(context.guild.id, context.channel.id, { locked: false });
    await interaction.reply(privateReplyPayload(interaction, { content: '🌐 房間已公開。' }));
    return;
  }

  if (id.startsWith('tempvoice_limit_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_limit_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`tempvoice_limit_select_${channelId}`)
        .setPlaceholder('選擇人數限制')
        .addOptions(
          { label: '2人', value: '2' },
          { label: '3人', value: '3' },
          { label: '5人', value: '5' },
          { label: '8人', value: '8' },
          { label: '無限制', value: '0' }
        )
    );
    await interaction.reply(privateReplyPayload(interaction, { content: '請選擇房間人數限制。', components: [row] }));
    return;
  }

  if (id.startsWith('tempvoice_rename_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_rename_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const modal = new ModalBuilder()
      .setCustomId(`tempvoice_rename_modal_${channelId}`)
      .setTitle('改名臨時語音房');
    const input = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('新的房間名稱')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(30)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  if (id.startsWith('tempvoice_transfer_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_transfer_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const members = [...context.channel.members.values()].filter((member) => !member.user.bot).slice(0, 25);
    if (!members.length) {
      await interaction.reply(privateReplyPayload(interaction, { content: '房內目前沒有可以移交的成員。' }));
      return;
    }
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`tempvoice_transfer_select_${channelId}`)
        .setPlaceholder('選擇新房主')
        .addOptions(members.map((member) => ({
          label: member.displayName.slice(0, 100),
          value: member.id
        })))
    );
    await interaction.reply(privateReplyPayload(interaction, { content: '請選擇新的房主。', components: [row] }));
    return;
  }

  if (id.startsWith('tempvoice_disband_cancel_')) {
    await interaction.reply(privateReplyPayload(interaction, { content: '已取消解散房間。' }));
    return;
  }

  if (id.startsWith('tempvoice_disband_confirm_')) {
    const context = await assertTempVoiceControl(interaction, getChannelIdFromCustomId(id, 'tempvoice_disband_confirm_'));
    if (!context) return;
    await interaction.reply(privateReplyPayload(interaction, { content: '正在解散房間...' }));
    for (const member of context.channel.members.values()) {
      await member.voice.setChannel(null, 'Temp voice disbanded by owner').catch(() => null);
    }
    const snapshot = { name: context.channel.name };
    await context.channel.delete('Temp voice disbanded by owner');
    await finalizeTempVoice(context.guild, context.channel.id, snapshot);
    return;
  }

  if (id.startsWith('tempvoice_disband_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_disband_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tempvoice_disband_confirm_${channelId}`)
        .setLabel('確認解散')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`tempvoice_disband_cancel_${channelId}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply(privateReplyPayload(interaction, { content: `確定要解散 ${context.channel} 嗎？`, components: [row] }));
  }
}

async function handleTempVoiceSelect(interaction) {
  if (interaction.customId.startsWith('tempvoice_limit_select_')) {
    const channelId = getChannelIdFromCustomId(interaction.customId, 'tempvoice_limit_select_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const limit = Number(interaction.values[0]);
    await context.channel.setUserLimit(limit, 'Temp voice user limit changed');
    updateTempVoiceRecord(context.guild.id, context.channel.id, { userLimit: limit || 0 });
    await interaction.reply(privateReplyPayload(interaction, { content: `👥 人數限制已更新為：${limit || '無限制'}` }));
    return true;
  }

  if (interaction.customId.startsWith('tempvoice_transfer_select_')) {
    const channelId = getChannelIdFromCustomId(interaction.customId, 'tempvoice_transfer_select_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return true;
    const nextOwnerId = interaction.values[0];
    updateTempVoiceRecord(context.guild.id, context.channel.id, { ownerId: nextOwnerId });
    await interaction.reply(privateReplyPayload(interaction, { content: `👑 已轉移房主給 <@${nextOwnerId}>` }));
    return true;
  }

  return false;
}

async function handleTempVoiceModal(interaction) {
  if (!interaction.customId.startsWith('tempvoice_rename_modal_')) return false;
  const channelId = getChannelIdFromCustomId(interaction.customId, 'tempvoice_rename_modal_');
  const context = await assertTempVoiceControl(interaction, channelId);
  if (!context) return true;

  const name = safeVoiceName(interaction.fields.getTextInputValue('name'));
  if (!name) {
    await interaction.reply(privateReplyPayload(interaction, { content: '名稱不可為空，且不能包含 @everyone、@here 或 discord.gg。' }));
    return true;
  }

  await context.channel.setName(`🔊｜${name}`, 'Temp voice renamed by owner');
  updateTempVoiceRecord(context.guild.id, context.channel.id, {
    roomName: `🔊｜${name}`,
    voiceChannelName: `🔊｜${name}`
  });
  await interaction.reply(privateReplyPayload(interaction, { content: `✏️ 房間已改名為：🔊｜${name}` }));
  return true;
}

module.exports = {
  addTempVoice,
  buildTempVoiceControlPayload,
  cancelPendingDeletion,
  createTemporaryVoice,
  getCreateVoiceGame,
  getTempVoiceRecord,
  getTempVoiceSettings,
  handleTempVoiceButton,
  handleTempVoiceModal,
  handleTempVoiceSelect,
  isTempVoice,
  readTempVoice,
  removeTempVoice,
  scheduleTempVoiceDeletion,
  sendOwnerControlPanel,
  transferOwnerIfNeeded,
  updateTempVoiceRecord,
  updateTempVoiceSettings
};
