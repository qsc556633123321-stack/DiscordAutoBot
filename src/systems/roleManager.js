const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { writeServerLog } = require('./serverLogs');

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
  '🎨 設計創作': ['🎨｜設計作品', '🖼｜好圖分享'],
  '🍜 生活閒聊': ['💬｜公開大廳', '💬｜日常交流']
};

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
    /身分組|領取|roles?/i.test(channel.name)
  ));
}

function canManageRole(botMember, role) {
  return role.editable && botMember.roles.highest.comparePositionTo(role) > 0;
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

  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    throw new Error('Bot 缺少 ManageRoles 權限，無法更新身分組。');
  }

  await setupSelfAssignableRoles(interaction.guild);

  for (const roleName of SELF_ASSIGNABLE_ROLES) {
    const role = interaction.guild.roles.cache.find((item) => item.name === roleName);
    if (!role) {
      failed.push(`${roleName}：角色不存在`);
      continue;
    }

    if (
      role.permissions.has(PermissionFlagsBits.Administrator) ||
      role.permissions.has(PermissionFlagsBits.ManageGuild) ||
      role.permissions.has(PermissionFlagsBits.ManageRoles)
    ) {
      failed.push(`${role.name}：安全限制，不操作高權限角色`);
      continue;
    }

    if (!canManageRole(botMember, role)) {
      failed.push(`${role.name}：Bot 角色順位不足，請把 Bot 角色移到此角色上方`);
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

  if (added.length || removed.length || failed.length) {
    await writeServerLog(interaction.guild, {
      title: '🎭 身分組已更新',
      description: `${interaction.user} 更新了自助身分組。`,
      color: failed.length ? 0xf2c94c : 0x57f287,
      fields: [
        { name: '加入', value: added.join('\n') || '無', inline: true },
        { name: '移除', value: removed.join('\n') || '無', inline: true },
        { name: '未完成', value: failed.join('\n').slice(0, 1024) || '無' }
      ]
    });
  }

  return {
    added,
    removed,
    failed,
    selected: [...selected],
    unlockedCategories: getUnlockedCategoriesForRoles(selected)
  };
}

module.exports = {
  SELF_ASSIGNABLE_ROLES,
  findRoleChannel,
  getRoleOptions,
  getUnlockedCategoriesForRoles,
  setupSelfAssignableRoles,
  updateMemberRoles
};
