const { PermissionFlagsBits } = require('discord.js');

const GUEST_ROLE_NAME = '👀 訪客';
const FORMAL_MEMBER_ROLE_NAME = '👤 正式成員';
const SELF_ASSIGNABLE_ROLE_NAMES = ['🎮 遊戲玩家', '📈 股票投資', '🧠 開發/AI', '🎨 創作者', '👤 正式成員'];
const GUEST_ALLOWED_PATTERNS = [/新人報到|welcome|報到/i, /社群規則|規則|rules/i, /身分組領取|身分組|roles/i, /伺服器導覽|導覽|guide/i, /客服支援|開啟客服單|ticket|support/i];

function createMemberGuardRuntimeAdapter({ repository, evaluateMemberGuard, logger = console, enableLinkGuardForSafeMode, writeServerLog, now = () => Date.now() } = {}) {
  const joinBuckets = new Map();
  const violationBuckets = new Map();
  const blockedBuckets = new Map();

  function findRoleByName(guild, name) {
    const roles = guild?.roles?.cache;
    if (!roles) return null;
    if (typeof roles.find === 'function') return roles.find((role) => role.name === name) || null;
    return [...roles.values()].find((role) => role.name === name) || null;
  }
  function getGuestRole(guild) { return findRoleByName(guild, GUEST_ROLE_NAME); }
  function isAdminMember(member) { return Boolean(member?.permissions?.has(PermissionFlagsBits.Administrator) || member?.permissions?.has(PermissionFlagsBits.ManageGuild) || member?.permissions?.has(PermissionFlagsBits.ManageMessages)); }
  function isGuestMember(member) { const role = getGuestRole(member?.guild); return Boolean(role && member?.roles?.cache?.has(role.id)); }
  function isTicketChannel(channel) { return channel?.name?.startsWith('ticket-') || /ticket/i.test(channel?.parent?.name || ''); }
  function getFacts(member) { return { memberId: member?.id, roleIds: [...(member?.roles?.cache?.keys?.() || [])], isBot: Boolean(member?.user?.bot), isOwner: member?.guild?.ownerId === member?.id, hasAdminPermission: isAdminMember(member), isGuest: isGuestMember(member), createdTimestamp: member?.user?.createdTimestamp }; }
  function evaluate(member) { return evaluateMemberGuard.execute({ guildId: member.guild.id, memberFacts: getFacts(member) }); }
  function record(bucketMap, key, durationMs) { const current = (bucketMap.get(key) || []).filter((time) => now() - time <= durationMs); current.push(now()); bucketMap.set(key, current); return current.length; }
  function count(bucketMap, key, durationMs) { const current = (bucketMap.get(key) || []).filter((time) => now() - time <= durationMs); bucketMap.set(key, current); return current.length; }
  function extractUrls(content) { return String(content || '').match(/(?:https?:\/\/|www\.)[^\s<>()]+|discord\.gg\/[a-z0-9-]+|discord(?:app)?\.com\/invite\/[a-z0-9-]+/gi) || []; }
  function hasEveryoneMention(message) { return Boolean(message?.mentions?.everyone || /@everyone|@here/i.test(message?.content || '')); }
  function hasHighRoleMention(message) { return Boolean(message?.mentions?.roles?.some((role) => role.permissions?.has(PermissionFlagsBits.Administrator) || role.permissions?.has(PermissionFlagsBits.ManageGuild) || role.permissions?.has(PermissionFlagsBits.ManageRoles) || /管理員|站長|admin|mod/i.test(role.name))); }

  async function log(guild, payload) {
    if (!writeServerLog) return;
    await writeServerLog(guild, { title: 'Member Guard', color: 0xeb5757, fields: Object.entries(payload).map(([name, value]) => ({ name, value: String(value || 'N/A'), inline: false })) }).catch(() => null);
  }
  async function warnAndDelete(message, reason, timeoutMinutes = 0) {
    record(blockedBuckets, message.guild.id, 10 * 60 * 1000);
    try { if (message.deletable) await message.delete(); } catch (error) { logger.error('Member Guard delete failed:', error); }
    if (timeoutMinutes > 0 && message.member?.moderatable && !isAdminMember(message.member)) {
      try { await message.member.timeout(timeoutMinutes * 60 * 1000, reason); } catch (error) { logger.error('Member Guard timeout failed:', error); }
    }
    try { const warning = await message.channel.send({ content: `${message.author} ${reason}` }); setTimeout(() => warning.delete().catch(() => null), 8000); } catch (error) { logger.error('Member Guard warning failed:', error); }
    await log(message.guild, { user: `${message.author?.tag || message.author?.id}`, reason, action: timeoutMinutes > 0 ? `delete + timeout ${timeoutMinutes}m` : 'delete', channel: `${message.channel}` });
    return true;
  }

  return {
    getMemberGuardSettings: (guildId) => repository.getSettings(guildId),
    updateMemberGuardSettings: (guildId, patch) => repository.updateSettings(guildId, patch),
    getRecentJoinCount: (guildId) => count(joinBuckets, guildId, 10 * 60 * 1000),
    getRecentBlockedCount: (guildId) => count(blockedBuckets, guildId, 10 * 60 * 1000),
    isGuestMember,
    isMemberRestricted(member) { return Boolean(member?.guild && evaluate(member).enforce); },
    shouldUseStrictLinkGuard(member) { return Boolean(member?.guild && evaluate(member).enforce); },
    getRestrictionMessage: () => '請先完成身分組領取後再使用語音功能。',
    async handleMemberGuardMessage(message) {
      if (!message?.guild || !message.member || message.author?.bot || isTicketChannel(message.channel)) return false;
      const decision = evaluate(message.member);
      if (decision.bypassed || decision.reasonCode === 'DISABLED') return false;
      const settings = decision.settings;
      const urls = extractUrls(message.content);
      if (decision.enforce && urls.length) return warnAndDelete(message, '新成員目前不能發送連結。', settings.newAccountTimeoutMinutes);
      if (settings.blockEveryoneMentions && hasEveryoneMention(message)) { const count = record(violationBuckets, `${message.guild.id}:${message.member.id}`, 30 * 60 * 1000); return warnAndDelete(message, '不允許 @everyone 或 @here。', count >= 3 ? settings.newAccountTimeoutMinutes : 0); }
      if (settings.blockRoleMentions && hasHighRoleMention(message)) { const count = record(violationBuckets, `${message.guild.id}:${message.member.id}`, 30 * 60 * 1000); return warnAndDelete(message, '不允許 ping 管理身分組。', count >= 3 ? settings.newAccountTimeoutMinutes : 0); }
      if (decision.reasonCode === 'NEW_ACCOUNT' && message.mentions?.users?.size > 5) return warnAndDelete(message, '新帳號不能大量 mention。', settings.newAccountTimeoutMinutes);
      return false;
    },
    async handleMemberGuardJoin(member) {
      if (!member?.guild || member.user?.bot) return;
      const settings = repository.getSettings(member.guild.id);
      if (!settings.enabled) return;
      const joins = record(joinBuckets, member.guild.id, Math.max(settings.joinBurstWindowSeconds, 1) * 1000);
      if (settings.guestLockdown) {
        let guestRole = getGuestRole(member.guild);
        if (!guestRole) guestRole = await member.guild.roles.create({ name: GUEST_ROLE_NAME, permissions: [], mentionable: false, reason: 'Member Guard guest lockdown role' }).catch(() => null);
        if (guestRole && member.guild.members.me?.roles?.highest?.comparePositionTo(guestRole) > 0) await member.roles.add(guestRole, 'Member Guard guest lockdown').catch(() => null);
      }
      if (joins > settings.joinBurstLimit && !settings.safeMode) {
        repository.updateSettings(member.guild.id, { safeMode: true });
        enableLinkGuardForSafeMode?.(member.guild.id);
        await log(member.guild, { reason: 'Join Burst Detection', action: 'safe_mode enabled', joins });
      }
    },
    async applyGuestLockdownPermissions(guild) {
      const settings = repository.getSettings(guild?.id);
      const guestRole = getGuestRole(guild);
      if (!settings.enabled || !settings.guestLockdown || !guestRole) return { updated: 0, skipped: 0 };
      let updated = 0; let skipped = 0;
      for (const channel of guild.channels.cache.values()) {
        try { const allowed = GUEST_ALLOWED_PATTERNS.some((pattern) => pattern.test(`${channel?.name || ''} ${channel?.parent?.name || ''}`)); await channel.permissionOverwrites.edit(guestRole, allowed ? { ViewChannel: true, ReadMessageHistory: true } : { ViewChannel: false }, { reason: 'Member Guard guest lockdown' }); updated += 1; } catch { skipped += 1; }
      }
      return { updated, skipped };
    },
    async releaseMember(member) {
      const guestRole = getGuestRole(member?.guild); const memberRole = findRoleByName(member?.guild, FORMAL_MEMBER_ROLE_NAME);
      if (guestRole && member.roles.cache.has(guestRole.id)) await member.roles.remove(guestRole, 'Member Guard manual release').catch(() => null);
      if (memberRole && member.guild.members.me?.roles?.highest?.comparePositionTo(memberRole) > 0) await member.roles.add(memberRole, 'Member Guard manual release').catch(() => null);
    },
    isVerifiedMember(member) { return SELF_ASSIGNABLE_ROLE_NAMES.some((name) => { const role = findRoleByName(member?.guild, name); return Boolean(role && member.roles.cache.has(role.id)); }); }
  };
}

module.exports = { createMemberGuardRuntimeAdapter };
