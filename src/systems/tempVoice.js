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
const {
  findGameCategory,
  findOrCreateGameCategory,
  getCreateEntryRecord,
  getGameNameFromCreateVoice,
  inferCreateEntryGame,
  isCreateVoiceChannel,
  registerCreateEntryChannel
} = require('./gameChannels');
const { writeServerLog } = require('./serverLogs');
const { scheduleVoiceHubUpdate } = require('./voiceHub');
const { createOrUpdateLfgCard, deleteLfgCard, scheduleLfgUpdate } = require('./lfgSystem');
const { recordTempVoiceCreated } = require('./voiceActivitySystem');
const { resolveGameIdentity } = require('../config/gameAliases');
const { readJson, writeJsonAtomic } = require('../infrastructure/storage/jsonStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TEMP_VOICE_FILE = path.join(DATA_DIR, 'temp-voice.json');
const TEMP_VOICE_SETTINGS_FILE = path.join(DATA_DIR, 'tempvoice-settings.json');
const CONTROL_CHANNEL_NAME = '🔒｜語音控制台';
const CLOSING_STALE_MS = 2 * 60 * 1000;
const pendingDeletes = new Map();
const finalizingRooms = new Set();

const DEFAULT_SETTINGS = {
  autoTransfer: true,
  autoDeleteSeconds: 30,
  createControlPanel: true,
  createActivityMessage: true,
  cleanupMode: 'disable_panel'
};

function readJsonFile(filePath) {
  return readJson(filePath, {});
}

function writeJsonFile(filePath, data) {
  try {
    writeJsonAtomic(filePath, data);
  } catch (error) {
    console.error(`寫入 ${path.basename(filePath)} 失敗:`, error);
  }
}

function readTempVoice() {
  return readJsonFile(TEMP_VOICE_FILE);
}

function writeTempVoice(data) {
  writeJsonFile(TEMP_VOICE_FILE, data);
}

function getTempVoiceRecord(guildId, channelId) {
  const record = readTempVoice()[guildId]?.[channelId] || null;
  if (!record) return null;
  return { status: 'active', ...record };
}

function updateTempVoiceRecord(guildId, channelId, patch) {
  const data = readTempVoice();
  if (!data[guildId]?.[channelId]) return null;
  data[guildId][channelId] = { status: 'active', ...data[guildId][channelId], ...patch };
  writeTempVoice(data);
  return data[guildId][channelId];
}

function addTempVoice(guildId, channelId, metadata) {
  const data = readTempVoice();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = {
    status: 'active',
    closingStartedAt: null,
    closingBy: null,
    ownerId: metadata.ownerId,
    controlOwnerId: metadata.controlOwnerId || metadata.ownerId,
    game: metadata.game,
    createdAt: new Date().toISOString(),
    transferredAt: null,
    voiceChannelId: channelId,
    voiceChannelName: metadata.voiceChannelName || null,
    roomName: metadata.roomName || metadata.voiceChannelName || null,
    locked: Boolean(metadata.locked),
    userLimit: metadata.userLimit ?? 5,
    linkedTextChannelId: metadata.linkedTextChannelId || null,
    textControlChannelId: metadata.textControlChannelId || null,
    gameSlug: metadata.gameSlug || null,
    controlPanelChannelId: metadata.controlPanelChannelId || null,
    controlPanelMessageId: metadata.controlPanelMessageId || null,
    activityChannelId: metadata.activityChannelId || null,
    activityMessageId: metadata.activityMessageId || null
  };
  writeTempVoice(data);
}

function removeTempVoice(guildId, channelId) {
  const data = readTempVoice();
  if (!data[guildId]?.[channelId]) return false;
  delete data[guildId][channelId];
  if (Object.keys(data[guildId]).length === 0) delete data[guildId];
  writeTempVoice(data);
  return true;
}

function isTempVoice(guildId, channelId) {
  return Boolean(getTempVoiceRecord(guildId, channelId));
}

function isRoomActive(record) {
  return record?.status === 'active';
}

function isClosingStale(record) {
  if (record?.status !== 'closing' || !record.closingStartedAt) return false;
  return Date.now() - new Date(record.closingStartedAt).getTime() > CLOSING_STALE_MS;
}

function readTempVoiceSettings() {
  return readJsonFile(TEMP_VOICE_SETTINGS_FILE);
}

function getTempVoiceSettings(guildId) {
  const data = readTempVoiceSettings();
  return { ...DEFAULT_SETTINGS, ...(data[guildId] || {}) };
}

function updateTempVoiceSettings(guildId, patch) {
  const data = readTempVoiceSettings();
  data[guildId] = { ...DEFAULT_SETTINGS, ...(data[guildId] || {}), ...patch };
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

function cleanDisplayName(value) {
  return String(value || '')
    .trim()
    .replace(/@everyone|@here/gi, '')
    .replace(/discord\.gg\/?\S*/gi, '')
    .replace(/\s+/g, ' ')
    .slice(0, 30);
}

function isNightPeriod(date = new Date()) {
  const hour = date.getHours();
  return hour >= 0 && hour < 5;
}

function generateSmartVoiceRoomName({ member, game, name, tags = [] } = {}) {
  const ownerName = cleanDisplayName(member?.displayName || member?.user?.globalName || member?.user?.username || '玩家') || '玩家';
  const rawName = cleanDisplayName(name);
  const tagText = `${rawName} ${tags.join(' ')}`;
  const isRank = /上分|rank|rk|積分|排位/i.test(tagText);

  if (isRank) return `🏆｜${ownerName} 上分房`;
  if (/深夜|夜聊|night/i.test(String(game || '')) || isNightPeriod()) return `🌙｜${ownerName} 的深夜房`;

  const identity = game ? resolveGameIdentity(game) : null;
  if (identity?.displayName) return `🎮｜${ownerName} 的${identity.displayName}房`;

  return `🎮｜${ownerName} 的語音房`;
}

function getCreateVoiceGame(channel) {
  if (!channel) return null;
  const metadata = getCreateEntryRecord(channel.guild.id, channel.id);
  if (metadata?.type === 'create_entry' && metadata.game) {
    const syncedGame = inferCreateEntryGame(channel) || metadata.game;
    registerCreateEntryChannel(channel.guild, channel, syncedGame);
    return syncedGame;
  }
  if (!isCreateVoiceChannel(channel)) return null;
  const game = getGameNameFromCreateVoice(channel);
  if (game) registerCreateEntryChannel(channel.guild, channel, game);
  return game;
}

function findActivityChannel(guild) {
  const preferredNames = ['💬｜一般聊天', '🎮｜找隊友大廳', '一般聊天', '找隊友大廳'];
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && preferredNames.includes(channel.name)
  ) || null;
}

function buildControlRows(channelId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`tempvoice_lock_${channelId}`).setLabel('鎖房').setEmoji('🔒').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`tempvoice_open_${channelId}`).setLabel('公開').setEmoji('🌐').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`tempvoice_limit_${channelId}`).setLabel('人數限制').setEmoji('👥').setStyle(ButtonStyle.Primary).setDisabled(disabled)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`tempvoice_rename_${channelId}`).setLabel('改名').setEmoji('✏️').setStyle(ButtonStyle.Primary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`tempvoice_transfer_${channelId}`).setLabel('移交房主').setEmoji('👑').setStyle(ButtonStyle.Primary).setDisabled(disabled),
      new ButtonBuilder().setCustomId(`tempvoice_disband_${channelId}`).setLabel('解散房間').setEmoji('❌').setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

function buildControlEmbed(channel, record) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎛 語音房控制台')
    .setDescription(
      `房間：${channel.name}\n` +
      `語音頻道：${channel}\n` +
      `房主：<@${record.ownerId}>\n` +
      `遊戲：${record.game || '未指定'}\n` +
      `狀態：${record.locked ? '已鎖定' : '公開'}\n` +
      `人數限制：${record.userLimit || '無限制'}\n` +
      `建立時間：${record.createdAt ? `<t:${Math.floor(new Date(record.createdAt).getTime() / 1000)}:R>` : '未知'}`
    )
    .setFooter({ text: '只有房主與管理員可以操作此面板。' })
    .setTimestamp();
}

function buildNewOwnerControlEmbed(channel, record) {
  return new EmbedBuilder()
    .setColor(0xf2c94c)
    .setTitle('👑 你已成為新的房主')
    .setDescription(
      `房間名稱：${channel.name}\n` +
      `遊戲分類：${record.game || '未指定'}\n` +
      `目前人數：${channel.members.size}/${record.userLimit || '無限制'}\n\n` +
      '你現在可以使用下方按鈕管理語音房：鎖房、公開、調整人數、改名、移交房主或解散房間。'
    )
    .setTimestamp();
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

function buildNoLongerOwnerEmbed(channel, oldOwnerId, newOwnerId) {
  return new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle('⚫ 你已不再是房主')
    .setDescription(
      `房間：${channel?.name || '未知'}\n` +
      `原房主：${oldOwnerId ? `<@${oldOwnerId}>` : '未知'}\n` +
      `新房主：${newOwnerId ? `<@${newOwnerId}>` : '未知'}\n\n` +
      '此控制台已失效。'
    )
    .setTimestamp();
}

function buildTempVoiceControlPayload(channel) {
  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  if (!record || record.status !== 'active') return null;
  return { embeds: [buildControlEmbed(channel, record)], components: buildControlRows(channel.id) };
}

function buildNewOwnerControlPayload(channel) {
  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  if (!record || record.status !== 'active') return null;
  return { embeds: [buildNewOwnerControlEmbed(channel, record)], components: buildControlRows(channel.id) };
}

async function fetchControlPanelMessage(guild, record) {
  if (!record.controlPanelChannelId || !record.controlPanelMessageId) return null;
  try {
    const channel = await guild.client.channels.fetch(record.controlPanelChannelId).catch(() => null);
    if (!channel?.messages) return null;
    return channel.messages.fetch(record.controlPanelMessageId).catch(() => null);
  } catch (error) {
    return null;
  }
}

async function invalidatePreviousOwnerPanel(guild, channel, record, oldOwnerId, newOwnerId) {
  const message = await fetchControlPanelMessage(guild, record);
  if (!message) return false;
  try {
    await message.edit({
      embeds: [buildNoLongerOwnerEmbed(channel, oldOwnerId, newOwnerId)],
      components: buildControlRows(channel.id, true)
    });
    return true;
  } catch (error) {
    return false;
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
    // DM/control-channel cleanup should not affect the main flow.
  }
}

function snapshotFromRecord(record, channelSnapshot = {}) {
  return {
    createdAt: record.createdAt,
    endedAt: new Date().toISOString(),
    ownerId: record.ownerId,
    game: record.game,
    roomName: channelSnapshot.name || record.roomName || record.voiceChannelName || `voice-${record.voiceChannelId}`
  };
}

async function finalizeTempVoice(guild, channelId, channelSnapshot = {}) {
  const finalizeKey = `${guild.id}:${channelId}`;
  if (finalizingRooms.has(finalizeKey)) return false;
  const record = getTempVoiceRecord(guild.id, channelId);
  if (!record) return false;
  if (record.status === 'ended') return false;
  finalizingRooms.add(finalizeKey);
  const snapshot = snapshotFromRecord(record, channelSnapshot);

  try {
    updateTempVoiceRecord(guild.id, channelId, {
      status: 'ended',
      endedAt: snapshot.endedAt,
      roomName: snapshot.roomName
    });
    await cleanupControlPanel(guild, channelId, snapshot);
    removeTempVoice(guild.id, channelId);
    scheduleVoiceHubUpdate(guild, { delayMs: 1000 });
    await deleteLfgCard(guild, channelId, snapshot);
    await writeServerLog(guild, {
      title: '🔊 Temp Voice 已結束',
      description: `房間 ${snapshot.roomName} 已清理。`,
      color: 0x2f3136,
      fields: [
        { name: '房主', value: snapshot.ownerId ? `<@${snapshot.ownerId}>` : '未知', inline: true },
        { name: '遊戲', value: snapshot.game || '未知', inline: true }
      ]
    });
    return true;
  } finally {
    finalizingRooms.delete(finalizeKey);
  }
}

async function getOrCreateControlChannel(guild, member) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === CONTROL_CHANNEL_NAME
  );
  if (!channel) {
    channel = await guild.channels.create({
      name: CONTROL_CHANNEL_NAME,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: guild.members.me.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels]
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
      .setDescription(`${member} 建立了 ${record.game} 語音房：${channel}\n目前人數：${limitText}\n想加入可以直接點語音房。`)
      .setTimestamp();
    const activityMessage = await targetChannel.send({ embeds: [activityEmbed] });
    updateTempVoiceRecord(guild.id, channel.id, {
      linkedTextChannelId: targetChannel.id,
      activityChannelId: targetChannel.id,
      activityMessageId: activityMessage.id
    });
    setTimeout(() => activityMessage.delete().catch(() => null), 10 * 60 * 1000);
  } catch (error) {
    console.error('發送 temp voice 公開通知失敗:', error);
  }
}

async function sendControlPanelToMember({ guild, channel, member, interaction = null, transfer = false }) {
  const record = getTempVoiceRecord(guild.id, channel.id);
  const settings = getTempVoiceSettings(guild.id);
  if (!settings.createControlPanel || !isRoomActive(record)) return null;
  const payload = transfer ? buildNewOwnerControlPayload(channel) : buildTempVoiceControlPayload(channel);
  if (!payload) return null;
  if (interaction) return payload;
  try {
    const dm = await member.send(payload);
    updateTempVoiceRecord(guild.id, channel.id, {
      controlOwnerId: member.id,
      controlPanelChannelId: dm.channelId || null,
      controlPanelMessageId: dm.id
    });
    return dm;
  } catch (error) {
    try {
      const controlChannel = await getOrCreateControlChannel(guild, member);
      const message = await controlChannel.send({ content: `${member}`, ...payload });
      updateTempVoiceRecord(guild.id, channel.id, {
        controlOwnerId: member.id,
        controlPanelChannelId: controlChannel.id,
        controlPanelMessageId: message.id,
        textControlChannelId: controlChannel.id
      });
      return message;
    } catch (fallbackError) {
      console.error('發送 temp voice 控制台失敗:', fallbackError);
      return null;
    }
  }
}

async function sendOwnerControlPanel({ guild, channel, member, interaction = null }) {
  return sendControlPanelToMember({ guild, channel, member, interaction, transfer: false });
}

async function createTemporaryVoice({ guild, member, game, name, limit = 5, createCategoryIfMissing = false }) {
  const category = createCategoryIfMissing ? await findOrCreateGameCategory(guild, game) : findGameCategory(guild, game);
  if (!category) throw new Error(`找不到 🎮｜${game} 分類，請先使用 /setup-game 建立遊戲分區。`);
  const userLimit = Math.max(0, Math.min(Number(limit) || 5, 99));
  const identity = resolveGameIdentity(game);
  const roomName = generateSmartVoiceRoomName({ member, game: identity.displayName, name }).slice(0, 90);
  const channel = await guild.channels.create({
    name: roomName,
    type: ChannelType.GuildVoice,
    parent: category.id,
    userLimit,
    reason: `Temporary party voice created by ${member.user.tag}`
  });
  addTempVoice(guild.id, channel.id, {
    game: identity.displayName,
    gameSlug: identity.slug,
    ownerId: member.id,
    controlOwnerId: member.id,
    userLimit,
    voiceChannelName: channel.name,
    roomName: channel.name
  });
  recordTempVoiceCreated(guild, member, channel, game);
  const record = getTempVoiceRecord(guild.id, channel.id);
  await sendActivityMessage({ guild, channel, member, record });
  await writeServerLog(guild, {
    title: '🔊 Temp Voice 已建立',
    description: `${member} 建立了 ${channel}。`,
    color: 0x57f287,
    fields: [
      { name: '遊戲', value: game || '未知', inline: true },
      { name: '人數限制', value: String(userLimit || '無限制'), inline: true }
    ]
  });
  scheduleVoiceHubUpdate(guild);
  await createOrUpdateLfgCard(guild, channel.id).catch((error) => console.error('建立 LFG 招募卡失敗:', error));
  return channel;
}

async function scheduleTempVoiceDeletion(channel) {
  if (!channel || channel.type !== ChannelType.GuildVoice) return;
  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  if (!isRoomActive(record)) return;
  if (pendingDeletes.has(channel.id)) return;
  const settings = getTempVoiceSettings(channel.guild.id);
  const timeout = setTimeout(async () => {
    pendingDeletes.delete(channel.id);
    try {
      const freshRecord = getTempVoiceRecord(channel.guild.id, channel.id);
      const freshChannel = channel.guild.channels.cache.get(channel.id);
      if (!freshChannel || freshChannel.members.size > 0 || !isRoomActive(freshRecord)) return;
      const snapshot = { name: freshChannel.name };
      await freshChannel.delete(`Temporary voice empty for ${settings.autoDeleteSeconds} seconds`);
      await finalizeTempVoice(channel.guild, channel.id, snapshot);
    } catch (error) {
      console.error('刪除臨時語音房失敗:', error);
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

function findNextOwner(channel, oldOwnerId) {
  if (channel.guild.afkChannelId === channel.id) return null;
  return [...channel.members.values()]
    .filter((member) => !member.user.bot)
    .filter((member) => member.id !== oldOwnerId)
    .filter((member) => member.voice.channelId === channel.id)[0] || null;
}

async function transferTempVoiceOwner({ guild, channel, oldOwnerId, newOwner, interaction = null, reason = 'Temp voice owner transfer' }) {
  const record = getTempVoiceRecord(guild.id, channel.id);
  if (!isRoomActive(record) || !newOwner || record.ownerId === newOwner.id) return null;
  await invalidatePreviousOwnerPanel(guild, channel, record, oldOwnerId || record.ownerId, newOwner.id);
  const transferredAt = new Date().toISOString();
  const updatedRecord = updateTempVoiceRecord(guild.id, channel.id, {
    ownerId: newOwner.id,
    controlOwnerId: newOwner.id,
    transferredAt,
    roomName: channel.name,
    voiceChannelName: channel.name,
    controlPanelChannelId: null,
    controlPanelMessageId: null
  });
  const panel = await sendControlPanelToMember({ guild, channel, member: newOwner, interaction, transfer: true });
  await writeServerLog(guild, {
    title: '👑 Temp Voice 房主已轉移',
    description: `${channel} 的房主已轉移。`,
    color: 0xf2c94c,
    fields: [
      { name: '舊房主', value: oldOwnerId ? `<@${oldOwnerId}>` : '未知', inline: true },
      { name: '新房主', value: `${newOwner}`, inline: true },
      { name: '房間', value: channel.name, inline: false }
    ]
  });
  scheduleVoiceHubUpdate(guild);
  scheduleLfgUpdate(guild, channel.id);
  return { record: updatedRecord, panel, transferredAt, reason };
}

async function transferOwnerIfNeeded(oldState) {
  const record = getTempVoiceRecord(oldState.guild.id, oldState.channelId);
  if (!isRoomActive(record) || record.ownerId !== oldState.id) return null;
  const settings = getTempVoiceSettings(oldState.guild.id);
  if (!settings.autoTransfer) return null;
  const channel = oldState.guild.channels.cache.get(oldState.channelId);
  if (!channel || channel.members.size === 0) return null;
  const nextOwner = findNextOwner(channel, oldState.id);
  if (!nextOwner) return null;
  const result = await transferTempVoiceOwner({ guild: oldState.guild, channel, oldOwnerId: oldState.id, newOwner: nextOwner, reason: 'Auto transfer after owner left voice' });
  const textChannel = record.linkedTextChannelId ? oldState.guild.channels.cache.get(record.linkedTextChannelId) : findActivityChannel(oldState.guild);
  if (textChannel?.isTextBased()) await textChannel.send(`👑 房主已自動轉移給 ${nextOwner}`).catch(() => null);
  return result;
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

function privateReplyPayload(interaction, payload) {
  return interaction.guild ? { ...payload, ephemeral: true } : payload;
}

async function replyRoomStatus(interaction, record) {
  if (record?.status === 'closing') {
    await interaction.reply(privateReplyPayload(interaction, { content: '此語音房正在解散中，請稍候。' }));
    return true;
  }
  if (record?.status === 'ended') {
    await interaction.reply(privateReplyPayload(interaction, { content: '此語音房已結束。' }));
    return true;
  }
  return false;
}

async function assertTempVoiceControl(interaction, channelId) {
  const channel = getTempVoiceChannelFromInteraction(interaction, channelId);
  if (!channel) {
    await interaction.reply(privateReplyPayload(interaction, { content: '此語音房已結束。' }));
    return null;
  }
  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  if (await replyRoomStatus(interaction, record)) return null;
  const guildMember = interaction.guild ? interaction.member : await channel.guild.members.fetch(interaction.user.id).catch(() => null);
  const isAdmin = Boolean(guildMember?.permissions?.has(PermissionFlagsBits.ManageChannels));
  if (!record) {
    await interaction.reply(privateReplyPayload(interaction, { content: '此語音房已結束。' }));
    return null;
  }
  if (interaction.user.id !== record.ownerId && !isAdmin) {
    await interaction.reply(privateReplyPayload(interaction, { content: '你已不是此房間房主。' }));
    return null;
  }
  return { guild: channel.guild, channel, record };
}

function getChannelIdFromCustomId(customId, prefix) {
  return customId.startsWith(prefix) ? customId.slice(prefix.length) : null;
}

async function beginDisbandRoom(interaction, context) {
  const startedAt = new Date().toISOString();
  updateTempVoiceRecord(context.guild.id, context.channel.id, {
    status: 'closing',
    closingBy: interaction.user.id,
    closingStartedAt: startedAt
  });
  cancelPendingDeletion(context.channel.id);
  await writeServerLog(context.guild, {
    title: '🧹 Temp Voice 解散開始',
    description: `${interaction.user} 開始解散 ${context.channel}。`,
    color: 0xf2c94c,
    fields: [
      { name: '房間', value: context.channel.name, inline: true },
      { name: '房主', value: `<@${context.record.ownerId}>`, inline: true }
    ]
  });
}

async function finishDisbandRoom(interaction, context, snapshot) {
  updateTempVoiceRecord(context.guild.id, context.channel.id, {
    status: 'ended',
    endedAt: new Date().toISOString()
  });
  await cleanupControlPanel(context.guild, context.channel.id, {
    createdAt: context.record.createdAt,
    endedAt: new Date().toISOString(),
    ownerId: context.record.ownerId,
    game: context.record.game,
    roomName: snapshot.name
  });
  removeTempVoice(context.guild.id, context.channel.id);
  scheduleVoiceHubUpdate(context.guild, { delayMs: 1000 });
  await deleteLfgCard(context.guild, context.channel.id, snapshot);
  await writeServerLog(context.guild, {
    title: '✅ Temp Voice 已解散',
    description: `${snapshot.name} 已完成解散流程。`,
    color: 0x57f287,
    fields: [
      { name: '解散者', value: `${interaction.user}`, inline: true },
      { name: '房間', value: snapshot.name, inline: true }
    ]
  });
}

async function handleTempVoiceButton(interaction) {
  const id = interaction.customId;
  if (id.startsWith('tempvoice_lock_')) {
    const context = await assertTempVoiceControl(interaction, getChannelIdFromCustomId(id, 'tempvoice_lock_'));
    if (!context) return;
    await context.channel.permissionOverwrites.edit(context.guild.roles.everyone.id, { Connect: false }, { reason: 'Temp voice locked by owner' });
    updateTempVoiceRecord(context.guild.id, context.channel.id, { locked: true });
    scheduleLfgUpdate(context.guild, context.channel.id);
    await interaction.reply(privateReplyPayload(interaction, { content: '🔒 房間已鎖定。' }));
    return;
  }
  if (id.startsWith('tempvoice_open_')) {
    const context = await assertTempVoiceControl(interaction, getChannelIdFromCustomId(id, 'tempvoice_open_'));
    if (!context) return;
    await context.channel.permissionOverwrites.edit(context.guild.roles.everyone.id, { Connect: true }, { reason: 'Temp voice opened by owner' });
    updateTempVoiceRecord(context.guild.id, context.channel.id, { locked: false });
    scheduleLfgUpdate(context.guild, context.channel.id);
    await interaction.reply(privateReplyPayload(interaction, { content: '🌐 房間已公開。' }));
    return;
  }
  if (id.startsWith('tempvoice_limit_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_limit_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId(`tempvoice_limit_select_${channelId}`).setPlaceholder('選擇人數限制').addOptions(
        { label: '2 人', value: '2' },
        { label: '3 人', value: '3' },
        { label: '5 人', value: '5' },
        { label: '8 人', value: '8' },
        { label: '無限制', value: '0' }
      )
    );
    await interaction.reply(privateReplyPayload(interaction, { content: '請選擇新的房間人數限制。', components: [row] }));
    return;
  }
  if (id.startsWith('tempvoice_rename_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_rename_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const modal = new ModalBuilder().setCustomId(`tempvoice_rename_modal_${channelId}`).setTitle('改名語音房');
    const input = new TextInputBuilder().setCustomId('name').setLabel('新的房間名稱').setStyle(TextInputStyle.Short).setMaxLength(30).setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    return;
  }
  if (id.startsWith('tempvoice_transfer_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_transfer_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const members = [...context.channel.members.values()].filter((member) => !member.user.bot && member.id !== context.record.ownerId).slice(0, 25);
    if (!members.length) {
      await interaction.reply(privateReplyPayload(interaction, { content: '房內目前沒有可以移交的成員。' }));
      return;
    }
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId(`tempvoice_transfer_select_${channelId}`).setPlaceholder('選擇新房主').addOptions(
        members.map((member) => ({ label: member.displayName.slice(0, 100), value: member.id }))
      )
    );
    await interaction.reply(privateReplyPayload(interaction, { content: '請選擇要移交給誰。', components: [row] }));
    return;
  }
  if (id.startsWith('tempvoice_disband_cancel_')) {
    await interaction.reply(privateReplyPayload(interaction, { content: '已取消解散房間。' }));
    return;
  }
  if (id.startsWith('tempvoice_disband_confirm_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_disband_confirm_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    await beginDisbandRoom(interaction, context);
    await interaction.reply(privateReplyPayload(interaction, { content: '正在解散房間...' }));
    const snapshot = { name: context.channel.name };
    for (const member of context.channel.members.values()) {
      await member.voice.setChannel(null, 'Temp voice disbanded by owner').catch(() => null);
    }
    try {
      await context.channel.delete('Temp voice disbanded by owner');
    } catch (error) {
      await writeServerLog(context.guild, {
        title: '⚠️ Temp Voice 刪除頻道失敗',
        description: `${snapshot.name} 已標記 ended，但刪除頻道失敗：${error.message}`,
        color: 0xeb5757
      });
    }
    await finishDisbandRoom(interaction, context, snapshot);
    return;
  }
  if (id.startsWith('tempvoice_disband_')) {
    const channelId = getChannelIdFromCustomId(id, 'tempvoice_disband_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`tempvoice_disband_confirm_${channelId}`).setLabel('確認解散').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`tempvoice_disband_cancel_${channelId}`).setLabel('取消').setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply(privateReplyPayload(interaction, { content: `確定要解散 ${context.channel} 嗎？`, components: [row] }));
  }
}

async function handleTempVoiceSelect(interaction) {
  if (interaction.customId.startsWith('tempvoice_limit_select_')) {
    const channelId = getChannelIdFromCustomId(interaction.customId, 'tempvoice_limit_select_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return true;
    const limit = Number(interaction.values[0]);
    await context.channel.setUserLimit(limit, 'Temp voice user limit changed');
    updateTempVoiceRecord(context.guild.id, context.channel.id, { userLimit: limit || 0 });
    scheduleVoiceHubUpdate(context.guild);
    scheduleLfgUpdate(context.guild, context.channel.id);
    await interaction.reply(privateReplyPayload(interaction, { content: `👥 人數限制已更新為：${limit || '無限制'}` }));
    return true;
  }
  if (interaction.customId.startsWith('tempvoice_transfer_select_')) {
    const channelId = getChannelIdFromCustomId(interaction.customId, 'tempvoice_transfer_select_');
    const context = await assertTempVoiceControl(interaction, channelId);
    if (!context) return true;
    const nextOwnerId = interaction.values[0];
    const nextOwner = await context.guild.members.fetch(nextOwnerId).catch(() => null);
    if (!nextOwner || nextOwner.voice.channelId !== context.channel.id) {
      await interaction.reply(privateReplyPayload(interaction, { content: '找不到新房主，或對方已不在此語音房。' }));
      return true;
    }
    await transferTempVoiceOwner({ guild: context.guild, channel: context.channel, oldOwnerId: context.record.ownerId, newOwner: nextOwner, reason: 'Manual temp voice owner transfer' });
    await interaction.reply(privateReplyPayload(interaction, { content: `👑 已轉移房主給 ${nextOwner}，並已發送新的控制台。` }));
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
    await interaction.reply(privateReplyPayload(interaction, { content: '房名不可為空，也不能包含 @everyone、@here 或 discord.gg。' }));
    return true;
  }
  const newName = `🔊｜${name}`;
  await context.channel.setName(newName, 'Temp voice renamed by owner');
  updateTempVoiceRecord(context.guild.id, context.channel.id, { roomName: newName, voiceChannelName: newName });
  scheduleVoiceHubUpdate(context.guild);
  scheduleLfgUpdate(context.guild, context.channel.id);
  await interaction.reply(privateReplyPayload(interaction, { content: `✏️ 房間已改名為：${newName}` }));
  return true;
}

async function cleanupStaleClosingRoom(guild, channelId, record, channel = null) {
  if (!isClosingStale(record)) return false;
  const snapshot = snapshotFromRecord(record, { name: channel?.name });
  updateTempVoiceRecord(guild.id, channelId, { status: 'ended', endedAt: snapshot.endedAt });
  if (channel) await channel.delete('Stale closing temp voice cleanup').catch(() => null);
  await cleanupControlPanel(guild, channelId, snapshot);
  removeTempVoice(guild.id, channelId);
  scheduleVoiceHubUpdate(guild, { delayMs: 1000 });
  await deleteLfgCard(guild, channelId, snapshot);
  await writeServerLog(guild, {
    title: '⚠️ Temp Voice 解散逾時清理',
    description: `${snapshot.roomName} closing 超過 2 分鐘，已視為 ended 並清理。`,
    color: 0xf2c94c
  });
  return true;
}

async function cleanupMissingTempVoices(client) {
  const data = readTempVoice();
  let removed = 0;
  for (const [guildId, records] of Object.entries(data)) {
    const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      delete data[guildId];
      removed += Object.keys(records || {}).length;
      continue;
    }
    for (const [channelId, rawRecord] of Object.entries(records || {})) {
      const record = { status: 'active', ...rawRecord };
      const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
      if (await cleanupStaleClosingRoom(guild, channelId, record, channel)) {
        removed += 1;
        continue;
      }
      if (!channel || channel.type !== ChannelType.GuildVoice) {
        await cleanupControlPanel(guild, channelId, {
          createdAt: record.createdAt,
          endedAt: new Date().toISOString(),
          ownerId: record.ownerId,
          game: record.game,
          roomName: record.roomName || record.voiceChannelName || `voice-${channelId}`
        });
        scheduleVoiceHubUpdate(guild, { delayMs: 1000 });
        await deleteLfgCard(guild, channelId);
        delete records[channelId];
        removed += 1;
        continue;
      }
      if (channel.members.size === 0 && record.status === 'active') await scheduleTempVoiceDeletion(channel);
    }
    if (Object.keys(records || {}).length === 0) delete data[guildId];
  }
  writeTempVoice(data);
  if (removed > 0) console.log(`Temp Voice cleanup removed ${removed} stale record(s).`);
  return removed;
}

async function handleTempVoiceChannelDelete(channel) {
  if (!channel?.guild || channel.type !== ChannelType.GuildVoice) return false;
  const record = getTempVoiceRecord(channel.guild.id, channel.id);
  if (!record) return false;
  if (record.status === 'closing' || record.status === 'ended') return false;
  await finalizeTempVoice(channel.guild, channel.id, { name: channel.name });
  scheduleVoiceHubUpdate(channel.guild, { delayMs: 1000 });
  return true;
}

module.exports = {
  addTempVoice,
  buildTempVoiceControlPayload,
  cancelPendingDeletion,
  cleanupMissingTempVoices,
  createTemporaryVoice,
  getCreateVoiceGame,
  getTempVoiceRecord,
  getTempVoiceSettings,
  handleTempVoiceButton,
  handleTempVoiceChannelDelete,
  handleTempVoiceModal,
  handleTempVoiceSelect,
  isTempVoice,
  readTempVoice,
  removeTempVoice,
  generateSmartVoiceRoomName,
  scheduleTempVoiceDeletion,
  sendOwnerControlPanel,
  transferOwnerIfNeeded,
  updateTempVoiceRecord,
  updateTempVoiceSettings
};
