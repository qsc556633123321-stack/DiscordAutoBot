const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const accessConfig = require('../config/roleChannelAccess');
const { isTempVoice } = require('./tempVoice');

const pendingRolePermissionPlans = new Map();
const ADMIN_BACKEND_CATEGORY = '🔒｜管理員後台';

function findRoleByName(guild, name) {
  return guild.roles.cache.find((role) => role.name === name) || null;
}

function findCategoryByName(guild, name) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
  ) || null;
}

function getCategoryChildren(guild, categoryId) {
  return [...guild.channels.cache.values()].filter((channel) => channel.parentId === categoryId);
}

function canManageRole(botMember, role) {
  return !role || role.managed || botMember.roles.highest.comparePositionTo(role) > 0;
}

function buildPermissionPlan(guild, requestedById) {
  const botMember = guild.members.me;
  const warnings = [];
  const actions = [];
  const adminRoles = accessConfig.adminRoles
    .map((name) => findRoleByName(guild, name))
    .filter(Boolean);

  for (const roleName of accessConfig.adminRoles) {
    if (!findRoleByName(guild, roleName)) warnings.push(`找不到管理角色：${roleName}`);
  }

  for (const rule of accessConfig.roleAccess) {
    const role = findRoleByName(guild, rule.roleName);
    if (!role) {
      warnings.push(`找不到身分組：${rule.roleName}`);
      continue;
    }
    if (!canManageRole(botMember, role)) warnings.push(`Bot 角色順位低於：${rule.roleName}`);

    for (const categoryName of rule.categories) {
      const category = findCategoryByName(guild, categoryName);
      if (!category) {
        warnings.push(`找不到分類：${categoryName}`);
        continue;
      }
      actions.push({
        type: 'role_category_access',
        roleName: rule.roleName,
        roleId: role.id,
        categoryName,
        categoryId: category.id
      });
    }
  }

  for (const categoryName of accessConfig.publicCategories) {
    const category = findCategoryByName(guild, categoryName);
    if (!category) {
      warnings.push(`找不到公開分類：${categoryName}`);
      continue;
    }
    actions.push({
      type: 'public_category',
      categoryName,
      categoryId: category.id
    });
  }

  const managedCategories = new Set([
    ...accessConfig.publicCategories,
    ...accessConfig.roleAccess.flatMap((rule) => rule.categories)
  ]);

  return {
    guildId: guild.id,
    requestedById,
    createdAt: Date.now(),
    adminRoles: adminRoles.map((role) => ({ id: role.id, name: role.name })),
    adminCategoryName: ADMIN_BACKEND_CATEGORY,
    managedCategories: [...managedCategories],
    publicChannels: accessConfig.publicChannels,
    actions,
    warnings
  };
}

async function getOrCreateLogChannel(guild) {
  let channel = guild.channels.cache.find(
    (item) => item.type === ChannelType.GuildText && ['server-logs', '📑｜server-logs'].includes(item.name)
  );
  if (channel) return channel;

  const adminCategory = findCategoryByName(guild, '🔒｜管理員後台');
  channel = await guild.channels.create({
    name: 'server-logs',
    type: ChannelType.GuildText,
    parent: adminCategory ? adminCategory.id : undefined,
    reason: 'Role permission setup log channel'
  });
  return channel;
}

function buildAdminOverwrites(plan) {
  return plan.adminRoles.map((role) => ({
    id: role.id,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.Connect
    ]
  }));
}

async function syncChildrenPermissions(guild, category) {
  const children = getCategoryChildren(guild, category.id);
  const synced = [];
  const skipped = [];

  for (const child of children) {
    if (child.name.startsWith('ticket-')) {
      skipped.push(child.name);
      continue;
    }
    if (child.type === ChannelType.GuildVoice && isTempVoice(guild.id, child.id)) {
      skipped.push(child.name);
      continue;
    }
    try {
      await child.lockPermissions();
      synced.push(child.name);
    } catch (error) {
      skipped.push(`${child.name}：${error.message}`);
    }
  }

  return { synced, skipped };
}

async function applyPermissionPlan(guild, plan) {
  const summary = {
    updatedCategories: [],
    syncedChannels: [],
    skipped: [],
    failed: []
  };
  const everyone = guild.roles.everyone;
  const adminOverwrites = buildAdminOverwrites(plan);

  const logChannel = await getOrCreateLogChannel(guild);
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0xf2c94c)
        .setTitle('即將套用身分組頻道權限')
        .setDescription(`分類數：${plan.managedCategories.length}\n警告：${plan.warnings.length}`)
        .setTimestamp()
    ]
  });

  const adminCategory = findCategoryByName(guild, plan.adminCategoryName || ADMIN_BACKEND_CATEGORY);
  if (adminCategory) {
    try {
      await adminCategory.permissionOverwrites.edit(guild.members.me.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        ManageChannels: true
      }, { reason: 'Ensure bot can keep managing admin backend' });

      for (const role of plan.adminRoles) {
        await adminCategory.permissionOverwrites.edit(role.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          Connect: true
        }, { reason: 'Ensure admin roles can view admin backend' });
      }
      summary.updatedCategories.push(`${adminCategory.name} (admin access ensured)`);
    } catch (error) {
      summary.failed.push(`${adminCategory.name}：${error.message}`);
    }
  }

  for (const categoryName of plan.managedCategories) {
    const category = findCategoryByName(guild, categoryName);
    if (!category) {
      summary.skipped.push(`找不到分類：${categoryName}`);
      continue;
    }

    if (categoryName === '🔒｜管理員後台') {
      summary.skipped.push('略過管理員後台權限，只保留原設定');
      continue;
    }

    const allowedRoleIds = plan.actions
      .filter((action) => action.type === 'role_category_access' && action.categoryName === categoryName)
      .map((action) => action.roleId);
    const publicCategory = accessConfig.publicCategories.includes(categoryName);

    const overwrites = [
      {
        id: everyone.id,
        allow: publicCategory ? [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory
        ] : [],
        deny: publicCategory ? [] : [PermissionFlagsBits.ViewChannel]
      },
      {
        id: guild.members.me.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.ManageChannels
        ]
      },
      ...adminOverwrites,
      ...allowedRoleIds.map((roleId) => ({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.Connect
        ]
      }))
    ];

    try {
      await category.permissionOverwrites.set(overwrites, 'Apply role based channel visibility');
      summary.updatedCategories.push(category.name);
      const syncResult = await syncChildrenPermissions(guild, category);
      summary.syncedChannels.push(...syncResult.synced);
      summary.skipped.push(...syncResult.skipped);
    } catch (error) {
      console.error(`套用分類權限 ${categoryName} 失敗：`, error);
      summary.failed.push(`${categoryName}：${error.message}`);
    }
  }

  return summary;
}

function buildRolePermissionEmbed(plan) {
  const ruleLines = accessConfig.roleAccess.map((rule) => (
    `• ${rule.roleName} -> ${rule.categories.join('、')}`
  ));

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('身分組與頻道權限套用預覽')
    .setDescription('preview 不會修改任何權限。execute 需要二次確認。')
    .addFields(
      { name: '公開分類', value: accessConfig.publicCategories.join('\n') || '無' },
      { name: '身分組可見分類', value: ruleLines.join('\n').slice(0, 1024) || '無' },
      { name: '警告', value: plan.warnings.join('\n').slice(0, 1024) || '無' }
    )
    .setTimestamp();
}

function saveRolePermissionPlan(id, plan) {
  pendingRolePermissionPlans.set(id, plan);
}

function getRolePermissionPlan(id) {
  return pendingRolePermissionPlans.get(id);
}

function deleteRolePermissionPlan(id) {
  pendingRolePermissionPlans.delete(id);
}

module.exports = {
  applyPermissionPlan,
  buildPermissionPlan,
  buildRolePermissionEmbed,
  deleteRolePermissionPlan,
  findCategoryByName,
  findRoleByName,
  getRolePermissionPlan,
  saveRolePermissionPlan,
  syncChildrenPermissions
};
