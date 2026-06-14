const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { writeServerLog } = require('./serverLogs');
const architecture = require('../domain/community/communityArchitectureV3');
const { expandRoleKeys } = require('../domain/community/permissionMatrix');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ROLE_SETTINGS_FILE = path.join(DATA_DIR, 'role-settings.json');

const GUEST_ROLE_NAME = '👀 訪客';
const GUEST_CLEANUP_DELAY_MIN_MS = 1200;
const GUEST_CLEANUP_DELAY_MAX_MS = 1800;
const GUEST_CLEANUP_PROGRESS_INTERVAL = 5;
const GUEST_CLEANUP_MAX_SAFE_MEMBERS = 200;
const guestCleanupPlans = new Map();
const DEFAULT_ROLE_SETTINGS = {
  removeGuestOnVerified: true,
  restoreGuestIfNoRoles: false
};

const SELF_ASSIGNABLE_ROLES = [
  '🎮 遊戲玩家',
  '📈 股票投資',
  '🧠 開發/AI',
  '🎨 創作者',
  '👤 正式成員'
];

const ROLE_UNLOCKS = {
  '🎮 遊戲玩家': ['🎮｜遊戲中心', '🔥｜熱門遊戲', '🎲｜玩家遊戲區'],
  '📈 股票投資': ['🧠｜知識交流'],
  '🧠 開發/AI': ['🧠｜知識交流'],
  '🎨 創作者': ['🎨｜興趣交流'],
  '👤 正式成員': ['💬｜社群大廳', '🎮｜遊戲中心', '🎨｜興趣交流', '🎉｜活動專區']
};

function ensureSettingsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ROLE_SETTINGS_FILE)) fs.writeFileSync(ROLE_SETTINGS_FILE, '{}\n', 'utf8');
}

function readSettingsData() {
  ensureSettingsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(ROLE_SETTINGS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('讀取 role-settings.json 失敗:', error);
    return {};
  }
}

function writeSettingsData(data) {
  ensureSettingsFile();
  try {
    fs.writeFileSync(ROLE_SETTINGS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('寫入 role-settings.json 失敗:', error);
  }
}

function getRoleSettings(guildId) {
  const data = readSettingsData();
  return {
    ...DEFAULT_ROLE_SETTINGS,
    ...(data[guildId] || {})
  };
}

function updateRoleSettings(guildId, patch) {
  const data = readSettingsData();
  data[guildId] = {
    ...getRoleSettings(guildId),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  writeSettingsData(data);
  return data[guildId];
}

function getRoleOptions() {
  return [
    { label: '遊戲玩家', value: '🎮 遊戲玩家', emoji: '🎮' },
    { label: '股票投資', value: '📈 股票投資', emoji: '📈' },
    { label: '開發/AI', value: '🧠 開發/AI', emoji: '🧠' },
    { label: '創作者', value: '🎨 創作者', emoji: '🎨' },
    { label: '先看看再說', value: '👤 正式成員', emoji: '👤' }
  ];
}

async function setupSelfAssignableRoles(guild) {
  const created = [];
  const existing = [];

  for (const roleName of SELF_ASSIGNABLE_ROLES) {
    const role = guild.roles.cache.find((item) => item.name === roleName);
    if (role) {
      existing.push(roleName);
      continue;
    }

    const createdRole = await guild.roles.create({
      name: roleName,
      permissions: [],
      mentionable: false,
      reason: 'Self assignable role setup'
    });
    created.push(createdRole.name);
  }

  return { created, existing };
}

function findRoleChannel(guild) {
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildText &&
    /身分組|角色|roles?/i.test(channel.name)
  ));
}

function canManageRole(botMember, role) {
  return Boolean(role?.editable && botMember?.roles?.highest?.comparePositionTo(role) > 0);
}

function findGuestRole(guild) {
  return guild.roles.cache.find((role) => [GUEST_ROLE_NAME, '👤 訪客', '訪客'].includes(role.name)) || null;
}

function isProtectedRole(role) {
  return role.permissions.has(PermissionFlagsBits.Administrator) ||
    role.permissions.has(PermissionFlagsBits.ManageGuild) ||
    role.permissions.has(PermissionFlagsBits.ManageRoles);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomCleanupDelay() {
  return GUEST_CLEANUP_DELAY_MIN_MS + Math.floor(Math.random() * (GUEST_CLEANUP_DELAY_MAX_MS - GUEST_CLEANUP_DELAY_MIN_MS + 1));
}

function getRetryAfterMs(error) {
  const retryAfter = error?.retryAfter ?? error?.rawError?.retry_after ?? error?.data?.retry_after;
  if (typeof retryAfter === 'number') return retryAfter > 100 ? retryAfter : retryAfter * 1000;
  const message = String(error?.message || '');
  const match = message.match(/retry(?:_| )after[:= ]+(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) * 1000 : 0;
}

function isRateLimitError(error) {
  return error?.status === 429 ||
    error?.code === 429 ||
    /rate.?limit|too many requests/i.test(String(error?.message || ''));
}

async function removeRoleWithRetry(member, role, reason) {
  try {
    await member.roles.remove(role, reason);
    return { ok: true, retried: false };
  } catch (error) {
    if (!isRateLimitError(error)) throw error;
    const retryAfterMs = Math.max(getRetryAfterMs(error), GUEST_CLEANUP_DELAY_MAX_MS);
    await wait(retryAfterMs);
    await member.roles.remove(role, `${reason} retry after rate limit`);
    return { ok: true, retried: true, retryAfterMs };
  }
}

function memberHasAdminPower(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageGuild) ||
    member.permissions.has(PermissionFlagsBits.ManageRoles);
}

function saveGuestCleanupPlan(plan) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  guestCleanupPlans.set(id, {
    ...plan,
    createdAt: new Date().toISOString()
  });
  setTimeout(() => guestCleanupPlans.delete(id), 15 * 60 * 1000);
  return id;
}

function getGuestCleanupPlan(id) {
  return guestCleanupPlans.get(id) || null;
}

function deleteGuestCleanupPlan(id) {
  guestCleanupPlans.delete(id);
}

function getUnlockedCategoriesForRoles(roleNames) {
  const categories = new Set();
  for (const roleName of roleNames) {
    for (const category of ROLE_UNLOCKS[roleName] || []) {
      categories.add(category);
    }
  }
  return [...categories];
}

function roleConfigForName(roleName) {
  return architecture.roles.find((config) => (
    config.name === roleName || (config.aliases || []).includes(roleName)
  )) || null;
}

function findConfiguredRole(guild, roleKey) {
  const config = architecture.roles.find((item) => item.key === roleKey);
  if (!config) return null;
  const names = new Set([config.name, ...(config.aliases || [])]);
  return guild.roles.cache.find((role) => names.has(role.name)) || null;
}

async function syncMemberRoleInheritance(member, reason = 'Sync Community OS role inheritance') {
  if (!member || member.user?.bot) return { added: [], failed: [] };
  const botMember = member.guild.members.me;
  const directRoleKeys = member.roles.cache
    .map((role) => roleConfigForName(role.name))
    .filter(Boolean)
    .map((config) => config.key);
  const inheritedRoleKeys = expandRoleKeys(directRoleKeys).filter((roleKey) => !directRoleKeys.includes(roleKey));
  const added = [];
  const failed = [];

  for (const inheritedRoleKey of inheritedRoleKeys) {
    const inheritedRole = findConfiguredRole(member.guild, inheritedRoleKey);
    if (!inheritedRole || member.roles.cache.has(inheritedRole.id)) continue;
    if (!canManageRole(botMember, inheritedRole)) {
      failed.push(`${inheritedRole.name}: Bot 角色順位不足`);
      continue;
    }
    try {
      await member.roles.add(inheritedRole, reason);
      added.push(inheritedRole.name);
    } catch (error) {
      failed.push(`${inheritedRole.name}: ${error.message}`);
    }
  }
  return { added, failed };
}

async function updateMemberRoles(interaction) {
  const selected = new Set(interaction.values || []);
  const member = interaction.member;
  const botMember = interaction.guild.members.me;
  const failed = [];
  const added = [];
  const removed = [];
  let guestRemoved = false;
  let guestRestored = false;

  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    throw new Error('Bot 缺少 ManageRoles 權限，無法分配身分組。');
  }

  await setupSelfAssignableRoles(interaction.guild);

  for (const roleName of SELF_ASSIGNABLE_ROLES) {
    const role = interaction.guild.roles.cache.find((item) => item.name === roleName);
    if (!role) {
      failed.push(`${roleName}：找不到身分組`);
      continue;
    }

    if (isProtectedRole(role)) {
      failed.push(`${role.name}：此角色含有高權限，已略過`);
      continue;
    }

    if (!canManageRole(botMember, role)) {
      failed.push(`${role.name}：Bot 角色順位不足，請把 Bot 角色移到此身分組上方`);
      continue;
    }

    if (selected.has(roleName) && !member.roles.cache.has(role.id)) {
      await member.roles.add(role, 'Self assign role select menu');
      added.push(role.name);
    }

    if (!selected.has(roleName) && member.roles.cache.has(role.id)) {
      await member.roles.remove(role, 'Self assign role select menu');
      removed.push(role.name);
    }
  }

  const inheritance = await syncMemberRoleInheritance(member, 'Grant inherited role after role selection');
  added.push(...inheritance.added);
  failed.push(...inheritance.failed);

  const hasFormalRoleAfterUpdate = SELF_ASSIGNABLE_ROLES.some((roleName) => {
    const role = interaction.guild.roles.cache.find((item) => item.name === roleName);
    return role && member.roles.cache.has(role.id);
  });
  const settings = getRoleSettings(interaction.guild.id);
  const guestRole = findGuestRole(interaction.guild);
  if (guestRole && !isProtectedRole(guestRole)) {
    if (!canManageRole(botMember, guestRole)) {
      if (member.roles.cache.has(guestRole.id) && (hasFormalRoleAfterUpdate || settings.restoreGuestIfNoRoles)) {
        failed.push('訪客：Bot 角色順位不足，無法調整訪客身分組');
      }
    } else if (settings.removeGuestOnVerified && hasFormalRoleAfterUpdate && member.roles.cache.has(guestRole.id)) {
      await member.roles.remove(guestRole, 'Remove guest role after self assign verification');
      guestRemoved = true;
    } else if (settings.restoreGuestIfNoRoles && !hasFormalRoleAfterUpdate && !member.roles.cache.has(guestRole.id)) {
      await member.roles.add(guestRole, 'Restore guest role when no self assign roles selected');
      guestRestored = true;
    }
  }

  if (added.length || removed.length || guestRemoved || guestRestored || failed.length) {
    await writeServerLog(interaction.guild, {
      title: '🎭 身分組已更新',
      description: `${interaction.user} 更新了自助身分組。`,
      color: failed.length ? 0xf2c94c : 0x57f287,
      fields: [
        { name: '已加入', value: added.join('\n') || '無', inline: true },
        { name: '已移除', value: removed.join('\n') || '無', inline: true },
        { name: '訪客狀態', value: guestRemoved ? '已移除訪客' : guestRestored ? '已恢復訪客' : '無變更', inline: true },
        { name: '未處理', value: failed.join('\n').slice(0, 1024) || '無' }
      ]
    });
  }

  return {
    added,
    removed,
    failed,
    guestRemoved,
    guestRestored,
    selected: [...selected],
    unlockedCategories: getUnlockedCategoriesForRoles(selected)
  };
}

async function buildGuestCleanupPlan(guild) {
  const guestRole = findGuestRole(guild);
  const formalRoles = SELF_ASSIGNABLE_ROLES
    .map((roleName) => guild.roles.cache.find((role) => role.name === roleName))
    .filter(Boolean);

  if (!guestRole || !formalRoles.length) {
    return {
      guestRole,
      formalRoles,
      candidates: [],
      skipped: [],
      warnings: guestRole ? ['找不到正式身分組'] : ['找不到「訪客」身分組']
    };
  }

  const members = await guild.members.fetch();
  const formalRoleIds = new Set(formalRoles.map((role) => role.id));
  const candidates = [];
  const skipped = [];

  for (const member of members.values()) {
    if (!member.roles.cache.has(guestRole.id)) continue;
    const matchedFormalRoles = member.roles.cache
      .filter((role) => formalRoleIds.has(role.id))
      .map((role) => role.name);
    if (!matchedFormalRoles.length) continue;

    if (member.user.bot) {
      skipped.push({ id: member.id, displayName: member.displayName, reason: 'Bot 成員' });
      continue;
    }
    if (member.id === guild.ownerId) {
      skipped.push({ id: member.id, displayName: member.displayName, reason: '伺服器擁有者' });
      continue;
    }
    if (memberHasAdminPower(member)) {
      skipped.push({ id: member.id, displayName: member.displayName, reason: '管理員或高權限成員' });
      continue;
    }

    candidates.push({
      id: member.id,
      tag: member.user.tag,
      displayName: member.displayName,
      formalRoles: matchedFormalRoles,
      member
    });
  }

  return { guestRole, formalRoles, candidates, skipped, warnings: [] };
}

async function executeGuestCleanup(guild, options = {}) {
  const botMember = guild.members.me;
  const plan = options.plan || await buildGuestCleanupPlan(guild);
  const cleaned = [];
  const failed = [...plan.warnings];
  const skipped = [...(plan.skipped || [])];

  if (!plan.guestRole) return { ...plan, cleaned, failed, skipped };
  if (isProtectedRole(plan.guestRole)) {
    failed.push('「訪客」身分組含有高權限，已略過。');
    return { ...plan, cleaned, failed, skipped };
  }
  if (!canManageRole(botMember, plan.guestRole)) {
    failed.push('Bot 角色順位不足，無法移除「訪客」身分組。');
    return { ...plan, cleaned, failed, skipped };
  }

  const candidates = plan.candidates.slice(0, GUEST_CLEANUP_MAX_SAFE_MEMBERS);
  if (plan.candidates.length > GUEST_CLEANUP_MAX_SAFE_MEMBERS) {
    skipped.push({
      id: 'overflow',
      displayName: '安全上限',
      reason: `本次最多清理 ${GUEST_CLEANUP_MAX_SAFE_MEMBERS} 人，剩餘 ${plan.candidates.length - GUEST_CLEANUP_MAX_SAFE_MEMBERS} 人請再執行一次`
    });
  }

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    try {
      const member = candidate.member;
      if (!member || !member.roles.cache.has(plan.guestRole.id)) {
        skipped.push({ id: candidate.id, displayName: candidate.displayName, reason: '已清理或成員不存在' });
        continue;
      }
      if (member.user.bot || member.id === guild.ownerId || memberHasAdminPower(member)) {
        skipped.push({ id: candidate.id, displayName: candidate.displayName, reason: '保護成員' });
        continue;
      }

      if (member.roles.cache.has(plan.guestRole.id)) {
        if (index > 0) await wait(randomCleanupDelay());
        await removeRoleWithRetry(member, plan.guestRole, 'Cleanup guest role after formal role assignment');
      }
      cleaned.push(candidate);

      await writeServerLog(guild, {
        title: '🧹 已清理訪客身分組',
        description: `${member} 已移除「${plan.guestRole.name}」。`,
        color: 0x57f287,
        fields: [
          { name: 'member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'role removed', value: plan.guestRole.name, inline: true },
          { name: 'timestamp', value: new Date().toISOString(), inline: false }
        ]
      });
    } catch (error) {
      failed.push(`${candidate.displayName}：${error.message}`);
    }

    const processed = index + 1;
    if (typeof options.onProgress === 'function' && (processed % GUEST_CLEANUP_PROGRESS_INTERVAL === 0 || processed === candidates.length)) {
      await options.onProgress({
        completed: processed,
        total: candidates.length,
        cleaned: cleaned.length,
        failed: failed.length,
        skipped: skipped.length
      });
    }
  }

  if (cleaned.length || failed.length) {
    await writeServerLog(guild, {
      title: '🧹 已清理訪客身分組',
      description: `批次清理完成，已移除 ${cleaned.length} 位成員的訪客身分組。`,
      color: failed.length ? 0xf2c94c : 0x57f287,
      fields: [
        { name: '已清理', value: cleaned.slice(0, 10).map((item) => item.displayName).join('\n') || '無', inline: true },
        { name: '失敗', value: failed.join('\n').slice(0, 1024) || '無', inline: true },
        { name: '略過', value: skipped.slice(0, 10).map((item) => `${item.displayName}：${item.reason}`).join('\n').slice(0, 1024) || '無' }
      ]
    });
  }

  return { ...plan, candidates, cleaned, failed, skipped };
}

module.exports = {
  DEFAULT_ROLE_SETTINGS,
  GUEST_ROLE_NAME,
  GUEST_CLEANUP_DELAY_MAX_MS,
  GUEST_CLEANUP_DELAY_MIN_MS,
  GUEST_CLEANUP_MAX_SAFE_MEMBERS,
  SELF_ASSIGNABLE_ROLES,
  buildGuestCleanupPlan,
  deleteGuestCleanupPlan,
  executeGuestCleanup,
  findGuestRole,
  findRoleChannel,
  getRoleOptions,
  getRoleSettings,
  getGuestCleanupPlan,
  getUnlockedCategoriesForRoles,
  setupSelfAssignableRoles,
  syncMemberRoleInheritance,
  saveGuestCleanupPlan,
  updateMemberRoles,
  updateRoleSettings
};
