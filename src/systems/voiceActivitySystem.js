const path = require('node:path');
const { ChannelType } = require('discord.js');
const {
  buildTitle,
  calculateLateNightMs,
  formatDuration,
  getAiFallbackText,
  getMonthKey,
  getRoomActivityLabel,
  getRoomMoodTag,
  getTopKey,
  getWeekKey
} = require('../utils/voiceStats');
const { readJson, writeJsonAtomic } = require('../infrastructure/storage/jsonStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VOICE_ACTIVITY_FILE = path.join(DATA_DIR, 'voice-activity.json');
const FLUSH_INTERVAL_MS = 60 * 1000;
const activeSessions = new Map();
let cache = null;
let dirty = false;
let flushTimer = null;

function getTempVoiceSystem() {
  return require('./tempVoice');
}

function readVoiceActivity() {
  if (cache) return cache;
  cache = readJson(VOICE_ACTIVITY_FILE, {});
  return cache;
}

function writeVoiceActivityNow() {
  if (!cache || !dirty) return;
  try {
    writeJsonAtomic(VOICE_ACTIVITY_FILE, cache);
    dirty = false;
  } catch (error) {
    console.error('Voice activity write failed:', error);
  }
}

function markDirty() {
  dirty = true;
}

function getGuildData(guildId) {
  const data = readVoiceActivity();
  if (!data[guildId]) {
    data[guildId] = {
      users: {},
      rooms: {},
      updatedAt: new Date().toISOString()
    };
  }
  return data[guildId];
}

function getUserStats(guildId, userId) {
  const guildData = getGuildData(guildId);
  if (!guildData.users[userId]) {
    guildData.users[userId] = {
      totalMs: 0,
      weekMs: {},
      monthMs: {},
      roomCreates: 0,
      tempVoiceCreates: 0,
      lateNightMs: 0,
      gameMs: {},
      coVoiceMs: {},
      joinedRooms: {},
      lastSeenAt: null
    };
  }
  return guildData.users[userId];
}

function sessionKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

function isTrackableVoiceChannel(channel) {
  if (!channel || channel.type !== ChannelType.GuildVoice) return false;
  if (channel.guild.afkChannelId === channel.id) return false;
  if (/建立.+語音/u.test(channel.name)) return false;
  return true;
}

function nonBotMembers(channel) {
  return [...(channel?.members?.values?.() || [])].filter((member) => !member.user.bot);
}

function inferGame(channel) {
  if (!channel) return '一般語音';
  const { getTempVoiceRecord } = getTempVoiceSystem();
  const tempRecord = getTempVoiceRecord(channel.guild.id, channel.id);
  if (tempRecord?.game) return tempRecord.game;
  const parentName = channel.parent?.name || '';
  const channelName = channel.name || '';
  if (/tft|聯盟戰棋/i.test(`${parentName} ${channelName}`)) return 'TFT';
  if (/lol|英雄聯盟/i.test(`${parentName} ${channelName}`)) return 'LOL';
  if (/minecraft|mc/i.test(`${parentName} ${channelName}`)) return 'Minecraft';
  if (/apex/i.test(`${parentName} ${channelName}`)) return 'APEX';
  if (/特戰/i.test(`${parentName} ${channelName}`)) return '特戰英豪';
  if (/深夜|聊天|一般/i.test(`${parentName} ${channelName}`)) return '深夜聊天';
  return parentName.replace(/^.+｜/, '') || '一般語音';
}

function addDuration(stats, startedAt, endedAt, game, coMemberIds, channelId) {
  const duration = Math.max(0, endedAt - startedAt);
  if (duration < 60 * 1000) return;
  const weekKey = getWeekKey(new Date(startedAt));
  const monthKey = getMonthKey(new Date(startedAt));
  stats.totalMs += duration;
  stats.weekMs[weekKey] = (stats.weekMs[weekKey] || 0) + duration;
  stats.monthMs[monthKey] = (stats.monthMs[monthKey] || 0) + duration;
  stats.lateNightMs += calculateLateNightMs(startedAt, endedAt);
  stats.gameMs[game] = (stats.gameMs[game] || 0) + duration;
  stats.joinedRooms[channelId] = (stats.joinedRooms[channelId] || 0) + 1;
  stats.lastSeenAt = new Date(endedAt).toISOString();

  for (const coMemberId of coMemberIds || []) {
    if (!coMemberId) continue;
    stats.coVoiceMs[coMemberId] = (stats.coVoiceMs[coMemberId] || 0) + duration;
  }
}

function closeMemberSession(guild, userId, endedAt = Date.now()) {
  const key = sessionKey(guild.id, userId);
  const session = activeSessions.get(key);
  if (!session) return;
  activeSessions.delete(key);
  const stats = getUserStats(guild.id, userId);
  addDuration(stats, session.startedAt, endedAt, session.game, session.coMemberIds, session.channelId);
  getGuildData(guild.id).updatedAt = new Date().toISOString();
  markDirty();
}

function openMemberSession(guild, member, channel, startedAt = Date.now()) {
  const members = nonBotMembers(channel);
  if (members.length < 2) return;
  const coMemberIds = members.map((item) => item.id).filter((id) => id !== member.id);
  activeSessions.set(sessionKey(guild.id, member.id), {
    guildId: guild.id,
    userId: member.id,
    channelId: channel.id,
    game: inferGame(channel),
    startedAt,
    coMemberIds
  });
}

function refreshChannelSessions(channel, now = Date.now()) {
  if (!isTrackableVoiceChannel(channel)) return;
  const members = nonBotMembers(channel);
  for (const member of members) closeMemberSession(channel.guild, member.id, now);
  if (members.length < 2) return;
  for (const member of members) openMemberSession(channel.guild, member, channel, now);
}

function trackVoiceStateUpdate(oldState, newState) {
  const now = Date.now();
  if (oldState.channelId && oldState.member && !oldState.member.user.bot) {
    closeMemberSession(oldState.guild, oldState.member.id, now);
    const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
    if (oldChannel) refreshChannelSessions(oldChannel, now);
  }

  if (newState.channelId) {
    const newChannel = newState.guild.channels.cache.get(newState.channelId);
    if (newChannel) refreshChannelSessions(newChannel, now);
  }
}

function recordTempVoiceCreated(guild, member, channel, game) {
  if (!guild || !member || member.user?.bot) return;
  const stats = getUserStats(guild.id, member.id);
  stats.roomCreates += 1;
  stats.tempVoiceCreates += 1;
  stats.lastSeenAt = new Date().toISOString();

  const guildData = getGuildData(guild.id);
  guildData.rooms[channel.id] = {
    channelId: channel.id,
    roomName: channel.name,
    ownerId: member.id,
    game: game || inferGame(channel),
    createdAt: new Date().toISOString(),
    peakMembers: Math.max(1, channel.members?.size || 1)
  };
  guildData.updatedAt = new Date().toISOString();
  markDirty();
}

function getProfile(guildId, userId) {
  const stats = getUserStats(guildId, userId);
  const topGame = getTopKey(stats.gameMs) || '尚未累積';
  const topPartnerId = getTopKey(stats.coVoiceMs);
  return {
    ...stats,
    title: buildTitle(stats),
    topGame,
    topPartnerId,
    aiText: getAiFallbackText(stats)
  };
}

function getLeaderboard(guildId, category = 'week') {
  const guildData = getGuildData(guildId);
  const weekKey = getWeekKey();
  const monthKey = getMonthKey();
  const rows = Object.entries(guildData.users || {}).map(([userId, stats]) => {
    let value = stats.weekMs?.[weekKey] || 0;
    if (category === 'month') value = stats.monthMs?.[monthKey] || 0;
    if (category === 'room_creates' || category === 'hosts') value = stats.roomCreates || 0;
    if (category === 'late_night') value = stats.lateNightMs || 0;
    return { userId, value, stats };
  });

  return rows
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function getRoomInfo(guild, channel) {
  if (!channel) return null;
  const { getTempVoiceRecord, isTempVoice } = getTempVoiceSystem();
  const record = isTempVoice(guild.id, channel.id) ? getTempVoiceRecord(guild.id, channel.id) : null;
  const guildData = getGuildData(guild.id);
  const stored = guildData.rooms[channel.id] || {};
  const createdAt = record?.createdAt || stored.createdAt || null;
  const memberCount = nonBotMembers(channel).length;
  const label = getRoomActivityLabel({ memberCount, createdAt });
  const moodTag = getRoomMoodTag({
    roomName: channel.name,
    game: record?.game || stored.game || inferGame(channel),
    memberCount,
    createdAt
  });
  return {
    channel,
    record,
    roomName: channel.name,
    ownerId: record?.ownerId || stored.ownerId || null,
    game: record?.game || stored.game || inferGame(channel),
    createdAt,
    memberCount,
    limit: channel.userLimit || record?.userLimit || 0,
    ageMs: createdAt ? Date.now() - new Date(createdAt).getTime() : 0,
    label,
    moodTag,
    isHot: label.includes('熱門')
  };
}

async function generateVoiceMoodText(kind, context = {}) {
  const fallback = context.fallback || getAiFallbackText(context.stats || {});
  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是 Discord 社群氣氛文案助手。使用繁體中文，溫暖、短句、不要誇張，不提金幣/RPG/抽卡。最多 35 字。'
        },
        {
          role: 'user',
          content: JSON.stringify({ kind, context })
        }
      ],
      temperature: 0.8,
      max_tokens: 80
    });
    return response.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (error) {
    return fallback;
  }
}

function initVoiceActivitySystem(client) {
  readVoiceActivity();
  if (!flushTimer) {
    flushTimer = setInterval(writeVoiceActivityNow, FLUSH_INTERVAL_MS);
    flushTimer.unref?.();
  }

  const save = () => writeVoiceActivityNow();
  process.once('beforeExit', save);
  process.once('SIGINT', () => {
    save();
    process.exit(0);
  });
  process.once('SIGTERM', () => {
    save();
    process.exit(0);
  });

  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (channel.type === ChannelType.GuildVoice) refreshChannelSessions(channel);
    }
  }
}

module.exports = {
  FLUSH_INTERVAL_MS,
  formatDuration,
  generateVoiceMoodText,
  getLeaderboard,
  getProfile,
  getRoomInfo,
  initVoiceActivitySystem,
  readVoiceActivity,
  recordTempVoiceCreated,
  trackVoiceStateUpdate,
  writeVoiceActivityNow
};
