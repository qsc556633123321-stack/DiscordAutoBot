const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PINS_FILE = path.join(DATA_DIR, 'announcement-pins.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PINS_FILE)) fs.writeFileSync(PINS_FILE, '{}', 'utf8');
}

function readPins() {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(PINS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    throw new Error(`讀取 announcement-pins.json 失敗：${error.message}`);
  }
}

function writePins(data) {
  ensureFile();
  try {
    fs.writeFileSync(PINS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    throw new Error(`寫入 announcement-pins.json 失敗：${error.message}`);
  }
}

function getGuildSettings(data, guildId) {
  if (!data[guildId]) {
    data[guildId] = {
      settings: { enabled: true, maxPins: 3 }
    };
  }
  if (!data[guildId].settings) data[guildId].settings = { enabled: true, maxPins: 3 };
  return data[guildId].settings;
}

function getChannelRecord(data, guildId, channelId) {
  if (!data[guildId]) data[guildId] = { settings: { enabled: true, maxPins: 3 } };
  if (!data[guildId][channelId]) data[guildId][channelId] = { pinnedMessages: [], updatedAt: new Date().toISOString() };
  return data[guildId][channelId];
}

function isAnnouncementChannel(channel) {
  return /公告|announcement|活動公告/i.test(channel.name);
}

function updateAnnouncementPinSettings(guildId, { enabled, maxPins }) {
  const data = readPins();
  const settings = getGuildSettings(data, guildId);
  settings.enabled = enabled;
  settings.maxPins = Math.max(1, Math.min(Number(maxPins) || 3, 10));
  writePins(data);
  return settings;
}

async function handleAnnouncementMessage(message) {
  if (!message.guild || message.author.bot || !isAnnouncementChannel(message.channel)) return null;

  const data = readPins();
  const settings = getGuildSettings(data, message.guild.id);
  if (!settings.enabled) return null;

  try {
    await message.pin('Auto pin announcement');
  } catch (error) {
    if (error.code === 30003 || /Maximum number of pins/i.test(error.message)) {
      await message.reply('公告置頂已達 Discord 上限，請管理員手動清理舊置頂訊息。');
      return { pinned: false, reason: 'pin_limit' };
    }
    console.error('自動置頂公告失敗：', error);
    return { pinned: false, reason: error.message };
  }

  const record = getChannelRecord(data, message.guild.id, message.channel.id);
  record.pinnedMessages = [
    message.id,
    ...record.pinnedMessages.filter((id) => id !== message.id)
  ].slice(0, settings.maxPins + 5);
  record.updatedAt = new Date().toISOString();
  writePins(data);

  const toUnpin = record.pinnedMessages.slice(settings.maxPins);
  record.pinnedMessages = record.pinnedMessages.slice(0, settings.maxPins);
  writePins(data);

  for (const messageId of toUnpin) {
    try {
      const oldMessage = await message.channel.messages.fetch(messageId);
      if (oldMessage.pinned) await oldMessage.unpin('Keep latest announcement pins only');
    } catch (error) {
      console.error(`解除舊公告置頂 ${messageId} 失敗：`, error);
    }
  }

  return { pinned: true };
}

module.exports = {
  handleAnnouncementMessage,
  isAnnouncementChannel,
  readPins,
  updateAnnouncementPinSettings
};
