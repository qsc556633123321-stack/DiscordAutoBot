const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { writeServerLog } = require('./serverLogs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ROLE_SETTINGS_FILE = path.join(DATA_DIR, 'role-settings.json');

const GUEST_ROLE_NAME = '訪客';
const DEFAULT_ROLE_SETTINGS = {
  removeGuestOnVerified: true,
  restoreGuestIfNoRoles: false
};

const SELF_ASSIGNABLE_ROLES = [
  '🎮 遊戲玩家',
  '🧑‍🤝‍🧑 找隊友通知',
  '📈 股票投資',
  '🛠 開發/AI',
  '🎨 設計創作',
  '🍜 生活閒聊',
  '📢 公告通知',
  '🎉 活動通知'
];

const ROLE_UNLOCKS = {
  '🎮 遊戲玩家': ['🎮｜聯盟戰棋', '🎮｜APEX', '🎮｜特戰英豪', '🎮｜LOL', '🎮｜Minecraft'],
  '📈 股票投資': ['📈｜投資討論'],
  '🛠 開發/AI': ['🛠｜創作與開發'],
  '🎨 設計創作': ['🎨｜設計作品', '📁｜作品展示', '🖼｜好圖分享'],
  '🍜 生活閒聊': ['💬｜公開大廳', '💬｜日常交流']
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
    { label: '找隊友通知', value: '🧑‍🤝‍🧑 找隊友通知', emoji: '🧑‍🤝‍🧑' },
    { label: '股票投資', value: '📈 股票投資', emoji: '📈' },
    { label: '開發/AI', value: '🛠 開發/AI', emoji: '🛠' },
    { label: '設計創作', value: '🎨 設計創作', emoji: '🎨' },
    { label: '生活閒聊', value: '🍜 生活閒聊', emoji: '🍜' },
    { label: '公告通知', value: '📢 公告通知', emoji: '📢' },
    { label: '活動通知', value: '🎉 活動通知', emoji: '🎉' }
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
  return guild.roles.cache.find((role) => role.name === GUEST_ROLE_NAME) || null;
}

function isProtectedRole(role) {
  return role.permissions.has(PermissionFlagsBits.Administrator) ||
    role.permissions.has(PermissionFlagsBits.ManageGuild) ||
    role.permissions.has(PermissionFlagsBits.ManageRoles);
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
      warnings: guestRole ? ['找不到正式身分組'] : ['找不到「訪客」身分組']
    };
  }

  const members = await guild.members.fetch();
  const formalRoleIds = new Set(formalRoles.map((role) => role.id));
  const candidates = members
    .filter((member) => member.roles.cache.has(guestRole.id) && member.roles.cache.some((role) => formalRoleIds.has(role.id)))
    .map((member) => ({
      id: member.id,
      tag: member.user.tag,
      displayName: member.displayName,
      formalRoles: member.roles.cache
        .filter((role) => formalRoleIds.has(role.id))
        .map((role) => role.name)
    }));

  return { guestRole, formalRoles, candidates, warnings: [] };
}

async function executeGuestCleanup(guild) {
  const botMember = guild.members.me;
  const plan = await buildGuestCleanupPlan(guild);
  const cleaned = [];
  const failed = [...plan.warnings];

  if (!plan.guestRole) return { ...plan, cleaned, failed };
  if (isProtectedRole(plan.guestRole)) {
    failed.push('「訪客」身分組含有高權限，已略過。');
    return { ...plan, cleaned, failed };
  }
  if (!canManageRole(botMember, plan.guestRole)) {
    failed.push('Bot 角色順位不足，無法移除「訪客」身分組。');
    return { ...plan, cleaned, failed };
  }

  for (const candidate of plan.candidates) {
    try {
      const member = await guild.members.fetch(candidate.id);
      if (member.roles.cache.has(plan.guestRole.id)) {
        await member.roles.remove(plan.guestRole, 'Cleanup guest role after formal role assignment');
      }
      cleaned.push(candidate);
    } catch (error) {
      failed.push(`${candidate.displayName}：${error.message}`);
    }
  }

  if (cleaned.length || failed.length) {
    await writeServerLog(guild, {
      title: '🧹 已清理訪客身分組',
      description: `批次清理完成，已移除 ${cleaned.length} 位成員的訪客身分組。`,
      color: failed.length ? 0xf2c94c : 0x57f287,
      fields: [
        { name: '已清理', value: cleaned.slice(0, 10).map((item) => item.displayName).join('\n') || '無', inline: true },
        { name: '未處理', value: failed.join('\n').slice(0, 1024) || '無', inline: true }
      ]
    });
  }

  return { ...plan, cleaned, failed };
}

module.exports = {
  DEFAULT_ROLE_SETTINGS,
  GUEST_ROLE_NAME,
  SELF_ASSIGNABLE_ROLES,
  buildGuestCleanupPlan,
  executeGuestCleanup,
  findGuestRole,
  findRoleChannel,
  getRoleOptions,
  getRoleSettings,
  getUnlockedCategoriesForRoles,
  setupSelfAssignableRoles,
  updateMemberRoles,
  updateRoleSettings
};
