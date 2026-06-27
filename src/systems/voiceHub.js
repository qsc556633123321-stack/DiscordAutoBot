const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, EmbedBuilder } = require('discord.js');
const { formatDuration, getRoomInfo } = require('./voiceActivitySystem');
const eventBus = require('../core/eventBus');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TEMP_VOICE_FILE = path.join(DATA_DIR, 'temp-voice.json');
const VOICE_HUB_FILE = path.join(DATA_DIR, 'voice-hub.json');
const DEFAULT_CHANNEL_NAME = '🎮｜目前語音房';
const updateTimers = new Map();
const lastUpdates = new Map();

function ensureFile(filePath, fallback = '{}') {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback, 'utf8');
}

function readJson(filePath) {
  ensureFile(filePath);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`讀取 ${path.basename(filePath)} 失敗:`, error);
    return {};
  }
}

function writeJson(filePath, data) {
  ensureFile(filePath);
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error(`寫入 ${path.basename(filePath)} 失敗:`, error);
  }
}

function readVoiceHubData() {
  return readJson(VOICE_HUB_FILE);
}

function writeVoiceHubData(data) {
  writeJson(VOICE_HUB_FILE, data);
}

function getVoiceHubConfig(guildId) {
  return readVoiceHubData()[guildId] || null;
}

function saveVoiceHubConfig(guildId, config) {
  const data = readVoiceHubData();
  data[guildId] = {
    ...(data[guildId] || {}),
    ...config,
    updatedAt: new Date().toISOString()
  };
  writeVoiceHubData(data);
  return data[guildId];
}

function disableVoiceHub(guildId) {
  const data = readVoiceHubData();
  if (!data[guildId]) return;
  data[guildId].autoUpdate = false;
  data[guildId].disabledAt = new Date().toISOString();
  writeVoiceHubData(data);
}

function getGameEmoji(game = '') {
  const text = String(game || '').toLowerCase();
  if (/tft|聯盟戰棋/.test(text)) return '🎮';
  if (/lol|英雄聯盟/.test(text)) return '⚔️';
  if (/minecraft|mc/.test(text)) return '⛏️';
  if (/apex/.test(text)) return '🔫';
  if (/深夜|聊天/.test(text)) return '🌙';
  return '🎮';
}

function readActiveRooms(guild) {
  const tempVoice = readJson(TEMP_VOICE_FILE);
  const records = tempVoice[guild.id] || {};

  return Object.entries(records)
    .map(([channelId, record]) => {
      const channel = guild.channels.cache.get(channelId);
      if (!channel || channel.type !== ChannelType.GuildVoice) return null;
      if ((record.status || 'active') !== 'active') return null;
      return {
        channel,
        record: { status: 'active', ...record },
        roomInfo: getRoomInfo(guild, channel),
        memberCount: channel.members.filter((member) => !member.user.bot).size,
        limit: channel.userLimit || record.userLimit || 0,
        createdAt: record.createdAt ? new Date(record.createdAt).getTime() : 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.memberCount !== a.memberCount) return b.memberCount - a.memberCount;
      return b.createdAt - a.createdAt;
    });
}

function buildVoiceHubEmbed(guild) {
  const rooms = readActiveRooms(guild);
  const embed = new EmbedBuilder()
    .setColor(rooms.length ? 0x57f287 : 0x2f3136)
    .setTimestamp();

  if (!rooms.length) {
    return embed
      .setTitle('🌙 目前沒有活躍語音房')
      .setDescription('快來建立第一個房間吧。');
  }

  const lines = rooms.slice(0, 15).map(({ channel, record, roomInfo, memberCount, limit }) => {
    const owner = record.ownerId ? `<@${record.ownerId}>` : '未記錄';
    const activeTime = roomInfo?.ageMs ? formatDuration(roomInfo.ageMs) : '剛建立';
    const label = roomInfo?.label || '🎧 開放加入中';
    const moodTag = roomInfo?.moodTag || '🎧 新手可加入';
    return [
      `${getGameEmoji(record.game)} ${channel}`,
      `👥 ${memberCount}/${limit || '無上限'}`,
      `🕒 ${activeTime}`,
      `👑 ${owner}`,
      `${label} · ${moodTag}`
    ].join('\n');
  });

  return embed
    .setTitle(`🟢 活躍語音房（${rooms.length}）`)
    .setDescription(lines.join('\n\n'));
}

async function ensureVoiceHubChannel(guild, config = {}) {
  if (config.channelId) {
    const existing = guild.channels.cache.get(config.channelId) || await guild.channels.fetch(config.channelId).catch(() => null);
    if (existing?.type === ChannelType.GuildText) return existing;
    disableVoiceHub(guild.id);
    return null;
  }

  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && item.name === DEFAULT_CHANNEL_NAME
  );

  if (!channel) {
    channel = await guild.channels.create({
      name: DEFAULT_CHANNEL_NAME,
      type: ChannelType.GuildText,
      reason: 'Voice Hub setup'
    });
  }

  saveVoiceHubConfig(guild.id, { channelId: channel.id });
  return channel;
}

async function updateVoiceHub(guild, options = {}) {
  const config = getVoiceHubConfig(guild.id);
  if (!config || (!config.autoUpdate && !options.force)) return false;

  const now = Date.now();
  const last = lastUpdates.get(guild.id) || 0;
  if (!options.force && now - last < 5000) {
    scheduleVoiceHubUpdate(guild, { delayMs: 5000 - (now - last) });
    return false;
  }

  lastUpdates.set(guild.id, now);
  const channel = await ensureVoiceHubChannel(guild, config);
  if (!channel) return false;

  const payload = { embeds: [buildVoiceHubEmbed(guild)] };
  try {
    let message = null;
    if (config.messageId) {
      message = await channel.messages.fetch(config.messageId).catch(() => null);
    }

    if (message) {
      await message.edit(payload);
    } else {
      message = await channel.send(payload);
      saveVoiceHubConfig(guild.id, { channelId: channel.id, messageId: message.id });
    }
    return true;
  } catch (error) {
    console.error('Voice Hub update failed:', error);
    return false;
  }
}

function scheduleVoiceHubUpdate(guild, options = {}) {
  if (!guild) return;
  const key = guild.id;
  if (updateTimers.has(key)) clearTimeout(updateTimers.get(key));
  const delayMs = Math.max(1000, options.delayMs ?? 5000);
  updateTimers.set(key, setTimeout(async () => {
    updateTimers.delete(key);
    await updateVoiceHub(guild).catch((error) => console.error('Voice Hub scheduled update failed:', error));
  }, delayMs));
}

async function setupVoiceHub(guild, options = {}) {
  const channel = options.channel || await ensureVoiceHubChannel(guild, {});
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error('Voice Hub 需要文字頻道。');
  }

  const config = saveVoiceHubConfig(guild.id, {
    guildId: guild.id,
    channelId: channel.id,
    autoUpdate: options.autoUpdate ?? true
  });

  await updateVoiceHub(guild, { force: true });
  return getVoiceHubConfig(guild.id) || config;
}

async function restoreVoiceHubs(client) {
  const data = readVoiceHubData();
  for (const [guildId, config] of Object.entries(data)) {
    if (!config.autoUpdate) continue;
    const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) continue;
    await updateVoiceHub(guild, { force: true }).catch((error) => console.error('Voice Hub restore failed:', error));
  }
}

function handleVoiceRoomEvent(payload = {}) {
  if (!payload.guild) return;
  scheduleVoiceHubUpdate(payload.guild, { delayMs: payload.delayMs ?? 1000 });
}

eventBus.on('voice.room.created', handleVoiceRoomEvent);
eventBus.on('voice.room.updated', handleVoiceRoomEvent);
eventBus.on('voice.room.deleted', handleVoiceRoomEvent);
eventBus.on('voice.activity.updated', handleVoiceRoomEvent);

module.exports = {
  getVoiceHubConfig,
  restoreVoiceHubs,
  scheduleVoiceHubUpdate,
  setupVoiceHub,
  updateVoiceHub
};
