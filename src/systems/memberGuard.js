const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const { GUEST_ROLE_NAME, SELF_ASSIGNABLE_ROLES, findGuestRole } = require('./roleManager');
const { updateLinkGuardSettings } = require('./linkGuard');
const { writeServerLog } = require('./serverLogs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'member-guard-settings.json');
const joinBuckets = new Map();
const violationBuckets = new Map();
const blockedBuckets = new Map();

const DEFAULT_SETTINGS = {
  enabled: true,
  guestLockdown: true,
  newAccountDays: 7,
  newAccountTimeoutMinutes: 10,
  blockEveryoneMentions: true,
  blockRoleMentions: true,
  joinBurstLimit: 10,
  joinBurstWindowSeconds: 60,
  safeMode: false,
  whitelistedRoleIds: []
};

const GUEST_ALLOWED_PATTERNS = [
  /新人報到|welcome|報到/i,
  /社群規則|規則|rules/i,
  /身分組|角色|領取|roles/i,
  /伺服器導覽|導覽|guide/i,
  /客服支援|開啟客服單|ticket|support/i
];

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}\n', 'utf8');
}

function readAllSettings() {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('讀取 member-guard-settings.json 失敗:', error);
    return {};
  }
}

function writeAllSettings(data) {
  ensureFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('寫入 member-guard-settings.json 失敗:', error);
  }
}

function getMemberGuardSettings(guildId) {
  const saved = readAllSettings()[guildId] || {};
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    whitelistedRoleIds: [...new Set(saved.whitelistedRoleIds || [])]
  };
}

function updateMemberGuardSettings(guildId, patch) {
  const data = readAllSettings();
  data[guildId] = {
    ...getMemberGuardSettings(guildId),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  writeAllSettings(data);
  return data[guildId];
}

function isAdminMember(member) {
  return member?.permissions?.has(PermissionFlagsBits.Administrator) ||
    member?.permissions?.has(PermissionFlagsBits.ManageGuild) ||
    member?.permissions?.has(PermissionFlagsBits.ManageMessages);
}

function isTicketChannel(channel) {
  return channel?.name?.startsWith('ticket-') || /ticket/i.test(channel?.parent?.name || '');
}

function isGuestMember(member) {
  return Boolean(findGuestRole(member.guild) && member.roles.cache.has(findGuestRole(member.guild).id));
}

function isVerifiedMember(member) {
  return SELF_ASSIGNABLE_ROLES.some((roleName) => {
    const role = member.guild.roles.cache.find((item) => item.name === roleName);
    return role && member.roles.cache.has(role.id);
  });
}

function isNewAccount(member, days) {
  return Date.now() - member.user.createdTimestamp < days * 24 * 60 * 60 * 1000;
}

function isWhitelisted(member, settings) {
  if (!member || member.user.bot) return true;
  if (isAdminMember(member)) return true;
  return settings.whitelistedRoleIds.some((roleId) => member.roles.cache.has(roleId));
}

function extractUrls(content) {
  return String(content || '').match(/(?:https?:\/\/|www\.)[^\s<>()]+|discord\.gg\/[a-z0-9-]+|discord(?:app)?\.com\/invite\/[a-z0-9-]+/gi) || [];
}

function hasEveryoneMention(message) {
  return message.mentions.everyone || /@everyone|@here/i.test(message.content || '');
}

function hasHighRoleMention(message) {
  return message.mentions.roles.some((role) => (
    role.permissions.has(PermissionFlagsBits.Administrator) ||
    role.permissions.has(PermissionFlagsBits.ManageGuild) ||
    role.permissions.has(PermissionFlagsBits.ManageRoles) ||
    /管理員|站長|admin|mod/i.test(role.name)
  ));
}

function recordBlocked(guildId) {
  const now = Date.now();
  const bucket = (blockedBuckets.get(guildId) || []).filter((time) => now - time <= 10 * 60 * 1000);
  bucket.push(now);
  blockedBuckets.set(guildId, bucket);
}

function getRecentBlockedCount(guildId) {
  const now = Date.now();
  const bucket = (blockedBuckets.get(guildId) || []).filter((time) => now - time <= 10 * 60 * 1000);
  blockedBuckets.set(guildId, bucket);
  return bucket.length;
}

function getRecentJoinCount(guildId) {
  const now = Date.now();
  const bucket = (joinBuckets.get(guildId) || []).filter((time) => now - time <= 10 * 60 * 1000);
  joinBuckets.set(guildId, bucket);
  return bucket.length;
}

async function logMemberGuard(guild, payload) {
  await writeServerLog(guild, {
    title: '🛡️ Member Guard 阻擋',
    color: 0xeb5757,
    fields: [
      { name: '使用者', value: payload.user || '未知', inline: false },
      { name: '原因', value: payload.reason || '未知', inline: true },
      { name: '動作', value: payload.action || '未知', inline: true },
      { name: '帳號建立時間', value: payload.createdAt || '未知', inline: false },
      { name: '是否訪客', value: payload.isGuest ? '是' : '否', inline: true },
      { name: 'safe_mode', value: payload.safeMode ? 'true' : 'false', inline: true },
      { name: '頻道', value: payload.channel || '無', inline: true },
      { name: '時間', value: new Date().toISOString(), inline: false }
    ]
  }).catch(() => null);
}

async function warnAndDelete(message, reason, timeoutMinutes = 0) {
  const settings = getMemberGuardSettings(message.guild.id);
  recordBlocked(message.guild.id);
  try {
    if (message.deletable) await message.delete();
  } catch (error) {
    console.error('Member Guard delete failed:', error);
  }

  if (timeoutMinutes > 0 && message.member?.moderatable && !isAdminMember(message.member)) {
    try {
      await message.member.timeout(timeoutMinutes * 60 * 1000, reason);
    } catch (error) {
      console.error('Member Guard timeout failed:', error);
    }
  }

  try {
    const warning = await message.channel.send({ content: `${message.author} ${reason}` });
    setTimeout(() => warning.delete().catch(() => null), 8000);
  } catch (error) {
    console.error('Member Guard warning failed:', error);
  }

  await logMemberGuard(message.guild, {
    user: `${message.author.tag} (${message.author.id})`,
    reason,
    action: timeoutMinutes > 0 ? `delete + timeout ${timeoutMinutes}m` : 'delete',
    createdAt: `<t:${Math.floor(message.author.createdTimestamp / 1000)}:F>`,
    isGuest: isGuestMember(message.member),
    safeMode: settings.safeMode,
    channel: `${message.channel}`
  });
  return true;
}

function addMentionViolation(member) {
  const key = `${member.guild.id}:${member.id}`;
  const now = Date.now();
  const bucket = (violationBuckets.get(key) || []).filter((time) => now - time <= 30 * 60 * 1000);
  bucket.push(now);
  violationBuckets.set(key, bucket);
  return bucket.length;
}

async function handleMemberGuardMessage(message) {
  if (!message.guild || !message.member || message.author.bot || isTicketChannel(message.channel)) return false;
  const settings = getMemberGuardSettings(message.guild.id);
  if (!settings.enabled || isWhitelisted(message.member, settings)) return false;

  const guest = isGuestMember(message.member);
  const newAccount = isNewAccount(message.member, settings.newAccountDays);
  const urls = extractUrls(message.content);

  if ((guest || newAccount || settings.safeMode) && urls.length) {
    return warnAndDelete(message, '請先完成身分組領取後再發送連結。', settings.newAccountTimeoutMinutes);
  }

  if (settings.blockEveryoneMentions && hasEveryoneMention(message)) {
    const count = addMentionViolation(message.member);
    return warnAndDelete(message, '禁止使用 @everyone 或 @here。', count >= 3 ? settings.newAccountTimeoutMinutes : 0);
  }

  if (settings.blockRoleMentions && hasHighRoleMention(message)) {
    const count = addMentionViolation(message.member);
    return warnAndDelete(message, '禁止 ping 管理員或高權限身分組。', count >= 3 ? settings.newAccountTimeoutMinutes : 0);
  }

  if (newAccount && message.mentions.users.size > 5) {
    return warnAndDelete(message, '新帳號禁止大量 mention。', settings.newAccountTimeoutMinutes);
  }

  return false;
}

async function handleMemberGuardJoin(member) {
  const settings = getMemberGuardSettings(member.guild.id);
  if (!settings.enabled || member.user.bot) return;

  const now = Date.now();
  const windowMs = Math.max(settings.joinBurstWindowSeconds, 1) * 1000;
  const bucket = (joinBuckets.get(member.guild.id) || []).filter((time) => now - time <= windowMs);
  bucket.push(now);
  joinBuckets.set(member.guild.id, bucket);

  if (settings.guestLockdown) {
    const guestRole = findGuestRole(member.guild) || await member.guild.roles.create({
      name: GUEST_ROLE_NAME,
      permissions: [],
      mentionable: false,
      reason: 'Member Guard guest lockdown role'
    }).catch(() => null);
    if (guestRole && member.guild.members.me.roles.highest.comparePositionTo(guestRole) > 0) {
      await member.roles.add(guestRole, 'Member Guard guest lockdown').catch(() => null);
    }
  }

  if (bucket.length > settings.joinBurstLimit && !settings.safeMode) {
    updateMemberGuardSettings(member.guild.id, { safeMode: true });
    updateLinkGuardSettings(member.guild.id, { enabled: true });
    await writeServerLog(member.guild, {
      title: '🚨 Join Burst Detection',
      color: 0xeb5757,
      description: `${settings.joinBurstWindowSeconds} 秒內加入 ${bucket.length} 人，已自動開啟 safe_mode。`
    }).catch(() => null);
  }
}

function isGuestAllowedChannel(channel) {
  const name = `${channel?.name || ''} ${channel?.parent?.name || ''}`;
  return GUEST_ALLOWED_PATTERNS.some((pattern) => pattern.test(name));
}

async function applyGuestLockdownPermissions(guild) {
  const settings = getMemberGuardSettings(guild.id);
  if (!settings.enabled || !settings.guestLockdown) return { updated: 0, skipped: 0 };
  const guestRole = findGuestRole(guild);
  if (!guestRole) return { updated: 0, skipped: 0, warning: '找不到「訪客」身分組' };
  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return { updated: 0, skipped: 0, warning: 'Bot 缺少 ManageChannels 權限' };
  }

  let updated = 0;
  let skipped = 0;
  for (const channel of guild.channels.cache.values()) {
    try {
      if (isGuestAllowedChannel(channel)) {
        await channel.permissionOverwrites.edit(guestRole, {
          ViewChannel: true,
          ReadMessageHistory: true
        }, { reason: 'Member Guard guest allowed channel' });
      } else {
        await channel.permissionOverwrites.edit(guestRole, {
          ViewChannel: false
        }, { reason: 'Member Guard guest lockdown' });
      }
      updated += 1;
    } catch (error) {
      skipped += 1;
    }
  }
  return { updated, skipped };
}

function isMemberRestricted(member) {
  if (!member?.guild || member.user.bot) return false;
  const settings = getMemberGuardSettings(member.guild.id);
  if (!settings.enabled) return false;
  if (isWhitelisted(member, settings)) return false;
  return settings.safeMode || isGuestMember(member) || isNewAccount(member, settings.newAccountDays);
}

function shouldUseStrictLinkGuard(member) {
  if (!member?.guild || member.user.bot) return false;
  const settings = getMemberGuardSettings(member.guild.id);
  if (!settings.enabled) return false;
  if (isWhitelisted(member, settings)) return false;
  return settings.safeMode || isGuestMember(member) || isNewAccount(member, settings.newAccountDays);
}

function getRestrictionMessage() {
  return '請先完成身分組領取後再使用語音功能。';
}

async function releaseMember(member) {
  const guestRole = findGuestRole(member.guild);
  const memberRole = member.guild.roles.cache.find((role) => role.name === '成員');
  if (guestRole && member.roles.cache.has(guestRole.id)) {
    await member.roles.remove(guestRole, 'Member Guard manual release').catch(() => null);
  }
  if (memberRole && member.guild.members.me.roles.highest.comparePositionTo(memberRole) > 0) {
    await member.roles.add(memberRole, 'Member Guard manual release').catch(() => null);
  }
}

module.exports = {
  DEFAULT_SETTINGS,
  getMemberGuardSettings,
  getRecentBlockedCount,
  getRecentJoinCount,
  getRestrictionMessage,
  applyGuestLockdownPermissions,
  handleMemberGuardJoin,
  handleMemberGuardMessage,
  isGuestMember,
  isMemberRestricted,
  releaseMember,
  shouldUseStrictLinkGuard,
  updateMemberGuardSettings
};
