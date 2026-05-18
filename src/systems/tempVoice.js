const fs = require('node:fs');
const path = require('node:path');
const { ChannelType } = require('discord.js');
const { findGameCategory, findOrCreateGameCategory, getGameNameFromCreateVoice, isCreateVoiceChannel } = require('./gameChannels');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TEMP_VOICE_FILE = path.join(DATA_DIR, 'temp-voice.json');
const pendingDeletes = new Map();

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TEMP_VOICE_FILE)) fs.writeFileSync(TEMP_VOICE_FILE, '{}', 'utf8');
}

function readTempVoice() {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(TEMP_VOICE_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('讀取 temp-voice.json 失敗：', error);
    return {};
  }
}

function writeTempVoice(data) {
  ensureFile();
  try {
    fs.writeFileSync(TEMP_VOICE_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('寫入 temp-voice.json 失敗：', error);
  }
}

function addTempVoice(guildId, channelId, metadata) {
  const data = readTempVoice();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][channelId] = {
    game: metadata.game,
    ownerId: metadata.ownerId,
    createdAt: new Date().toISOString()
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
  const data = readTempVoice();
  return Boolean(data[guildId] && data[guildId][channelId]);
}

function safeVoiceName(value) {
  return value
    .trim()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}\-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 45);
}

async function createTemporaryVoice({ guild, member, game, name, limit = 5, createCategoryIfMissing = false }) {
  const category = createCategoryIfMissing
    ? await findOrCreateGameCategory(guild, game)
    : findGameCategory(guild, game);
  if (!category) {
    throw new Error(`找不到 🎮｜${game} 分類，請先使用 /setup-game 建立遊戲分區。`);
  }
  const label = safeVoiceName(name || member.user.username) || member.user.id.slice(-6);
  const channel = await guild.channels.create({
    name: `🔊｜${game}-${label}`,
    type: ChannelType.GuildVoice,
    parent: category.id,
    userLimit: Math.max(1, Math.min(Number(limit) || 5, 99)),
    reason: `Temporary party voice created by ${member.user.tag}`
  });

  addTempVoice(guild.id, channel.id, {
    game,
    ownerId: member.id
  });

  return channel;
}

async function scheduleTempVoiceDeletion(channel) {
  if (!channel || channel.type !== ChannelType.GuildVoice) return;
  if (!isTempVoice(channel.guild.id, channel.id)) return;
  if (pendingDeletes.has(channel.id)) return;

  const timeout = setTimeout(async () => {
    pendingDeletes.delete(channel.id);
    try {
      const freshChannel = channel.guild.channels.cache.get(channel.id);
      if (!freshChannel || freshChannel.members.size > 0) return;
      if (!isTempVoice(channel.guild.id, channel.id)) return;
      await freshChannel.delete('Temporary voice empty for 30 seconds');
      removeTempVoice(channel.guild.id, channel.id);
    } catch (error) {
      console.error('刪除臨時語音頻道失敗：', error);
    }
  }, 30000);

  pendingDeletes.set(channel.id, timeout);
}

function cancelPendingDeletion(channelId) {
  const timeout = pendingDeletes.get(channelId);
  if (!timeout) return;
  clearTimeout(timeout);
  pendingDeletes.delete(channelId);
}

function getCreateVoiceGame(channel) {
  if (!isCreateVoiceChannel(channel)) return null;
  return getGameNameFromCreateVoice(channel.name);
}

module.exports = {
  addTempVoice,
  cancelPendingDeletion,
  createTemporaryVoice,
  getCreateVoiceGame,
  isTempVoice,
  readTempVoice,
  removeTempVoice,
  scheduleTempVoiceDeletion
};
