const { ChannelType, PermissionFlagsBits } = require('discord.js');

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

function getRoleOptions() {
  return [
    { label: '遊戲玩家', value: '🎮 遊戲玩家', emoji: '🎮' },
    { label: '找隊友通知', value: '🧑‍🤝‍🧑 找隊友通知', emoji: '🤝' },
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
    /身分組領取|身分組|roles?/i.test(channel.name)
  ));
}

function canManageRole(botMember, role) {
  return role.editable && botMember.roles.highest.comparePositionTo(role) > 0;
}

async function updateMemberRoles(interaction) {
  const selected = new Set(interaction.values);
  const member = interaction.member;
  const botMember = interaction.guild.members.me;
  const failed = [];
  const added = [];
  const removed = [];

  for (const roleName of SELF_ASSIGNABLE_ROLES) {
    const role = interaction.guild.roles.cache.find((item) => item.name === roleName);
    if (!role) continue;

    if (role.permissions.has(PermissionFlagsBits.Administrator) || role.permissions.has(PermissionFlagsBits.ManageGuild)) {
      failed.push(`${role.name}：不操作管理權限角色`);
      continue;
    }

    if (!canManageRole(botMember, role)) {
      failed.push(`${role.name}：Bot 角色順位不足`);
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

  return { added, removed, failed };
}

function findRoleChannelV2(guild) {
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildText &&
    /身分組|領取|roles?/i.test(channel.name)
  ));
}

async function updateMemberRolesV2(interaction) {
  const selected = new Set(interaction.values);
  const member = interaction.member;
  const botMember = interaction.guild.members.me;
  const failed = [];
  const added = [];
  const removed = [];

  if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
    throw new Error('Bot 缺少 ManageRoles 權限，無法分配身分組。');
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
      failed.push(`${role.name}：高權限角色受保護`);
      continue;
    }

    if (!canManageRole(botMember, role)) {
      failed.push(`${role.name}：Bot 角色順位不足`);
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

  return { added, removed, failed };
}

module.exports = {
  SELF_ASSIGNABLE_ROLES,
  findRoleChannel: findRoleChannelV2,
  getRoleOptions,
  setupSelfAssignableRoles,
  updateMemberRoles: updateMemberRolesV2
};
