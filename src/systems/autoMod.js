const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { handleLinkGuardMessage } = require('./linkGuard');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'automod-settings.json');
const userMessageBuckets = new Map();
const userContentBuckets = new Map();

const DEFAULT_SETTINGS = {
  spamEnabled: true,
  inviteEnabled: true,
  linkEnabled: true,
  mentionEnabled: true,
  repeatEnabled: true,
  newAccountEnabled: true,
  timeoutDurationMinutes: 5,
  whitelistedRoleIds: [],
  inviteWhitelist: [],
  blacklistedLinks: ['bit.ly', 'grabify', 'iplogger']
};

function ensureSettingsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}', 'utf8');
}

function readAllSettings() {
  ensureSettingsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('讀取 automod-settings.json 失敗:', error);
    return {};
  }
}

function writeAllSettings(data) {
  ensureSettingsFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('寫入 automod-settings.json 失敗:', error);
  }
}

function getAutoModSettings(guildId) {
  const data = readAllSettings();
  return {
    ...DEFAULT_SETTINGS,
    ...(data[guildId] || {}),
    blacklistedLinks: [
      ...new Set([...(DEFAULT_SETTINGS.blacklistedLinks || []), ...((data[guildId] || {}).blacklistedLinks || [])])
    ],
    whitelistedRoleIds: (data[guildId] || {}).whitelistedRoleIds || []
  };
}

function updateAutoModSettings(guildId, updates) {
  const data = readAllSettings();
  const current = getAutoModSettings(guildId);
  data[guildId] = { ...current, ...updates, updatedAt: new Date().toISOString() };
  writeAllSettings(data);
  return data[guildId];
}

function addBlacklistLink(guildId, value) {
  if (!value) return getAutoModSettings(guildId);
  const settings = getAutoModSettings(guildId);
  const blacklistedLinks = [...new Set([...settings.blacklistedLinks, value.toLowerCase().trim()])];
  return updateAutoModSettings(guildId, { blacklistedLinks });
}

function addWhitelistRole(guildId, roleId) {
  if (!roleId) return getAutoModSettings(guildId);
  const settings = getAutoModSettings(guildId);
  const whitelistedRoleIds = [...new Set([...settings.whitelistedRoleIds, roleId])];
  return updateAutoModSettings(guildId, { whitelistedRoleIds });
}

function isTicketChannel(channel) {
  return channel?.name?.startsWith('ticket-') || channel?.parent?.name?.includes('客服');
}

function isWhitelisted(message, settings) {
  if (!message.guild || !message.member) return true;
  if (message.author.bot) return true;
  if (isTicketChannel(message.channel)) return true;
  const perms = message.member.permissions;
  if (
    perms.has(PermissionFlagsBits.Administrator) ||
    perms.has(PermissionFlagsBits.ManageGuild) ||
    perms.has(PermissionFlagsBits.ManageMessages)
  ) {
    return true;
  }
  return settings.whitelistedRoleIds.some((roleId) => message.member.roles.cache.has(roleId));
}

function bucketKey(message) {
  return `${message.guild.id}:${message.author.id}`;
}

function detectSpam(message) {
  const key = bucketKey(message);
  const now = Date.now();
  const bucket = (userMessageBuckets.get(key) || []).filter((time) => now - time <= 5000);
  bucket.push(now);
  userMessageBuckets.set(key, bucket);
  return bucket.length > 6;
}

function detectRepeatedContent(message) {
  const content = message.content.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!content) return false;
  const key = bucketKey(message);
  const bucket = (userContentBuckets.get(key) || []).filter((item) => Date.now() - item.time <= 30000);
  bucket.push({ content, time: Date.now() });
  userContentBuckets.set(key, bucket.slice(-8));
  return bucket.filter((item) => item.content === content).length >= 3;
}

function detectInvite(content) {
  const match = content.match(/(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function detectSuspiciousLink(content, settings) {
  const lower = content.toLowerCase();
  return settings.blacklistedLinks.find((item) => item && lower.includes(item.toLowerCase()));
}

function isNewAccount(member) {
  return Date.now() - member.user.createdTimestamp < 3 * 24 * 60 * 60 * 1000;
}

async function findLogChannel(guild) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && /server-logs|整理紀錄|log/i.test(channel.name)
  );
}

async function logAutoMod(message, action) {
  try {
    const logChannel = await findLogChannel(message.guild);
    if (!logChannel) return;
    const embed = new EmbedBuilder()
      .setColor(0xeb5757)
      .setTitle('AutoMod action')
      .addFields(
        { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: false },
        { name: 'Channel', value: `${message.channel}`, inline: true },
        { name: 'Rule', value: action.rule, inline: true },
        { name: 'Action', value: action.action, inline: true },
        { name: 'Content', value: (message.content || '無內容').slice(0, 900), inline: false }
      )
      .setTimestamp();
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('AutoMod log failed:', error);
  }
}

async function warnUser(message, reason) {
  try {
    const warning = await message.channel.send({
      content: `${message.author} 請注意：${reason}`
    });
    setTimeout(() => warning.delete().catch(() => null), 8000);
  } catch (error) {
    console.error('AutoMod warning failed:', error);
  }
}

async function deleteMessage(message) {
  try {
    if (message.deletable) await message.delete();
  } catch (error) {
    console.error('AutoMod delete failed:', error);
  }
}

async function timeoutMember(message, settings, reason) {
  try {
    if (!message.member || !message.member.moderatable) return false;
    await message.member.timeout(settings.timeoutDurationMinutes * 60 * 1000, reason);
    return true;
  } catch (error) {
    console.error('AutoMod timeout failed:', error);
    return false;
  }
}

async function applyAction(message, settings, action) {
  await deleteMessage(message);
  if (action.timeout) {
    const timedOut = await timeoutMember(message, settings, action.reason);
    action.action = timedOut ? `delete + timeout ${settings.timeoutDurationMinutes}m` : 'delete';
  }
  await warnUser(message, action.reason);
  await logAutoMod(message, action);
  return true;
}

async function handleAutoModMessage(message) {
  if (!message.guild || !message.content) return false;
  const settings = getAutoModSettings(message.guild.id);
  if (isWhitelisted(message, settings)) return false;

  const handledByLinkGuard = await handleLinkGuardMessage(message);
  if (handledByLinkGuard) return true;

  const inviteCode = detectInvite(message.content);
  if (settings.newAccountEnabled && inviteCode && isNewAccount(message.member)) {
    return applyAction(message, settings, {
      rule: 'new_account_invite',
      reason: '新帳號禁止發送 Discord 邀請連結',
      timeout: true
    });
  }

  if (settings.spamEnabled && detectSpam(message)) {
    return applyAction(message, settings, {
      rule: 'spam',
      reason: '5 秒內訊息過多，已觸發防洗版',
      timeout: true
    });
  }

  if (settings.mentionEnabled && message.mentions.users.size > 5) {
    return applyAction(message, settings, {
      rule: 'mass_mention',
      reason: '一次 mention 過多成員',
      timeout: false
    });
  }

  if (settings.inviteEnabled && inviteCode && !settings.inviteWhitelist.includes(inviteCode)) {
    return applyAction(message, settings, {
      rule: 'discord_invite',
      reason: '禁止未白名單 Discord 邀請廣告',
      timeout: false
    });
  }

  const suspiciousLink = settings.linkEnabled ? detectSuspiciousLink(message.content, settings) : null;
  if (suspiciousLink) {
    return applyAction(message, settings, {
      rule: 'suspicious_link',
      reason: `偵測到可疑連結：${suspiciousLink}`,
      timeout: false
    });
  }

  if (settings.repeatEnabled && detectRepeatedContent(message)) {
    return applyAction(message, settings, {
      rule: 'repeated_message',
      reason: '短時間內重複相同內容',
      timeout: false
    });
  }

  return false;
}

module.exports = {
  addBlacklistLink,
  addWhitelistRole,
  getAutoModSettings,
  handleAutoModMessage,
  updateAutoModSettings
};
