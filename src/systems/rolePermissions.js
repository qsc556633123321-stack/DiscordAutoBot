const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const accessConfig = require('../config/roleChannelAccess');
const { isTempVoice } = require('./tempVoice');
const { writeServerLog } = require('./serverLogs');

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
    if (!canManageRole(botMember, role)) warnings.push(`Bot 角色順位可能不足：${rule.roleName}`);

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
      skipped.push(`${child.name}：ticket 頻道不處理`);
      continue;
    }
    if (child.type === ChannelType.GuildVoice && isTempVoice(guild.id, child.id)) {
      skipped.push(`${child.name}：臨時語音不處理`);
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

  await writeServerLog(guild, {
    title: '🔐 開始套用身分組頻道權限',
    description: `將處理 ${plan.managedCategories.length} 個分類。`,
    color: 0xf2c94c,
    fields: [{ name: '警告', value: plan.warnings.join('\n').slice(0, 1024) || '無' }]
  });

  const adminCategory = findCategoryByName(guild, plan.adminCategoryName || ADMIN_BACKEND_CATEGORY);
  if (adminCategory) {
    try {
      await adminCategory.permissionOverwrites.edit(guild.members.me.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        ManageChannels: true
      }, { reason: 'Ensure bot can manage admin backend' });

      await adminCategory.permissionOverwrites.edit(everyone.id, {
        ViewChannel: false
      }, { reason: 'Hide admin backend from everyone' });

      for (const role of plan.adminRoles) {
        await adminCategory.permissionOverwrites.edit(role.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          Connect: true
        }, { reason: 'Ensure admin roles can view admin backend' });
      }
      summary.updatedCategories.push(`${adminCategory.name} (管理區已隱藏)`);
      const syncResult = await syncChildrenPermissions(guild, adminCategory);
      summary.syncedChannels.push(...syncResult.synced);
      summary.skipped.push(...syncResult.skipped);
    } catch (error) {
      summary.failed.push(`${adminCategory.name}：${error.message}`);
    }
  } else {
    summary.skipped.push('找不到管理員後台分類');
  }

  for (const categoryName of plan.managedCategories) {
    const category = findCategoryByName(guild, categoryName);
    if (!category) {
      summary.skipped.push(`找不到分類：${categoryName}`);
      continue;
    }

    if (categoryName === ADMIN_BACKEND_CATEGORY) continue;

    const allowedRoleIds = plan.actions
      .filter((action) => action.type === 'role_category_access' && action.categoryName === categoryName)
      .map((action) => action.roleId);
    const publicCategory = accessConfig.publicCategories.includes(categoryName);

    const overwrites = [
      {
        id: everyone.id,
        allow: publicCategory ? [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.Connect,
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
      console.error(`套用分類權限失敗 ${categoryName}:`, error);
      summary.failed.push(`${categoryName}：${error.message}`);
    }
  }

  await writeServerLog(guild, {
    title: '✅ 身分組頻道權限套用完成',
    description: `已更新 ${summary.updatedCategories.length} 個分類，同步 ${summary.syncedChannels.length} 個子頻道。`,
    color: summary.failed.length ? 0xf2c94c : 0x57f287,
    fields: [
      { name: '更新分類', value: summary.updatedCategories.join('\n').slice(0, 1024) || '無' },
      { name: '略過', value: summary.skipped.join('\n').slice(0, 1024) || '無' },
      { name: '失敗', value: summary.failed.join('\n').slice(0, 1024) || '無' }
    ]
  });

  return summary;
}

function buildRolePermissionEmbed(plan) {
  const ruleLines = accessConfig.roleAccess.map((rule) => (
    `${rule.roleName} → ${rule.categories.join('、')}`
  ));

  const actionLines = plan.actions.map((action) => {
    if (action.type === 'public_category') return `公開：${action.categoryName}`;
    return `${action.roleName} 可看：${action.categoryName}`;
  });

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('身分組與頻道權限套用預覽')
    .setDescription('preview 不會修改權限；execute 會顯示確認按鈕，確認後才套用。')
    .addFields(
      { name: '@everyone 可看分類', value: accessConfig.publicCategories.join('\n') || '無' },
      { name: '身分組解鎖分類', value: ruleLines.join('\n').slice(0, 1024) || '無' },
      { name: '將更新的分類', value: actionLines.join('\n').slice(0, 1024) || '無' },
      { name: '安全保護', value: '不處理 ticket- 頻道、不處理臨時語音、不刪除頻道、不改名頻道。' },
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
