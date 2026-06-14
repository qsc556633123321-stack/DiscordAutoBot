const { fromThrowable, ok } = require('../../core/result');
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const architecture = require('../../domain/community/communityArchitectureV3');
const {
  directRoleKeysForCategory,
  expandRoleKeys,
  permissionProfileForCategory,
  roleCanAccessCategory
} = require('../../domain/community/permissionMatrix');
const { buildGuestGatePlan, checkGuestVisibility, checkNativeOnboardingReferences } = require('../../legacy/permissions/guestGate');
const rolePermissions = require('../../legacy/permissions/rolePermissions');
const communityBootstrap = require('../../legacy/community/communityBootstrapSystem');
const permissionWriter = require('../../infrastructure/discord/discordPermissionWriter');

function buildRepairPlan(guild, options = {}) {
  try {
    const scope = options.scope || 'all';
    const plan = scope === 'guest_gate'
      ? buildGuestGatePlan(guild, options)
      : buildMatrixPermissionRepairPlan(guild, options);
    return ok(plan);
  } catch (error) {
    return fromThrowable(error, 'PERMISSION_PLAN_FAILED');
  }
}

function permissionRuleForCategoryKey(categoryKey) {
  const profile = permissionProfileForCategory(categoryKey);
  if (!profile) return null;
  const roleNames = directRoleKeysForCategory(categoryKey)
    .filter((roleKey) => !['everyone', 'guest', 'owner', 'admin', 'mod'].includes(roleKey))
    .map((roleKey) => architecture.roles.find((role) => role.key === roleKey)?.name)
    .filter(Boolean);
  const visibilityType = {
    public_entry: 'public_entry',
    formal_member: 'formal_member_visible',
    game: 'role_restricted',
    knowledge: 'role_restricted',
    night: 'hidden_special',
    admin: 'private_admin',
    archive: 'archive'
  }[profile];
  return {
    visibilityType,
    roleName: roleNames.length === 1 ? roleNames[0] : undefined,
    roleNames,
    specialRoleName: profile === 'night' ? roleNames[0] : undefined
  };
}

function buildMatrixPermissionRepairPlan(guild, options = {}) {
  const scope = options.scope || 'all';
  const actions = [];
  const warnings = [];
  for (const channel of guild.channels.cache.values()) {
    const category = channel.type === ChannelType.GuildCategory ? channel : channel.parent;
    const categoryKey = resolveCategoryKey(category);
    if (!categoryKey) {
      if (channel.type === ChannelType.GuildCategory) warnings.push(`${channel.name}: category key 不存在`);
      continue;
    }
    if (scope === 'games' && !['game_center', 'popular_games', 'player_games', 'dynamic_game'].includes(categoryKey)) continue;
    if (scope === 'admin' && categoryKey !== 'admin') continue;
    if (scope === 'onboarding' && categoryKey !== 'entry') continue;
    if (scope === 'restricted' && ['entry', 'lobby', 'game_center', 'interests', 'events'].includes(categoryKey)) continue;

    const rule = permissionRuleForCategoryKey(categoryKey);
    if (!rule?.visibilityType) {
      warnings.push(`${channel.name}: ${categoryKey} 沒有 visibility profile`);
      continue;
    }
    actions.push({
      action: 'sync_permission',
      type: 'sync_permission',
      targetId: channel.id,
      targetName: channel.name,
      categoryKey,
      visibilityType: rule.visibilityType,
      roleName: rule.roleName,
      roleNames: rule.roleNames,
      specialRoleName: rule.specialRoleName,
      reason: `Permission Matrix: ${categoryKey}`,
      confidence: 100,
      risk: 'medium',
      requiresConfirmation: true
    });
  }
  return {
    id: options.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    guildId: guild.id,
    requestedById: options.requestedById,
    scope,
    optimizationMode: 'permissions_only',
    mode: options.mode || 'preview',
    communityRulesVersion: 'Permission Matrix',
    aiUsed: false,
    warnings,
    createdAt: Date.now(),
    actions
  };
}

async function inspectGuestGate(guild) {
  try {
    return ok({
      visibility: checkGuestVisibility(guild),
      onboarding: await checkNativeOnboardingReferences(guild)
    });
  } catch (error) {
    return fromThrowable(error, 'GUEST_GATE_INSPECTION_FAILED');
  }
}

function buildRolePlan(guild, requestedById) {
  try {
    return ok(buildMatrixRolePlan(guild, requestedById));
  } catch (error) {
    return fromThrowable(error, 'ROLE_PERMISSION_PLAN_FAILED');
  }
}

function inspectOnboarding(guild) {
  try {
    return ok(communityBootstrap.checkOnboardingVisibility(guild));
  } catch (error) {
    return fromThrowable(error, 'ONBOARDING_INSPECTION_FAILED');
  }
}

async function setChannelLocked(channel, everyoneRole, locked, actorTag) {
  return permissionWriter.edit(
    channel,
    everyoneRole,
    { SendMessages: locked ? false : null },
    `Channel ${locked ? 'locked' : 'unlocked'} by ${actorTag}`
  );
}

function normalizeName(name = '') {
  return String(name).normalize('NFKC').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function resolveCategoryKey(category) {
  if (!category) return null;
  const normalized = normalizeName(category.name);
  const matched = architecture.categories.find((config) => (
    [config.name, ...(config.aliases || [])].some((name) => normalizeName(name) === normalized)
  ));
  if (matched) return matched.key;
  const childNames = [...category.guild.channels.cache.values()]
    .filter((channel) => channel.parentId === category.id)
    .map((channel) => normalizeName(channel.name));
  return childNames.some((name) => name.includes('建立語音')) ? 'dynamic_game' : null;
}

function roleKeysForDiscordRole(guild, role) {
  if (role.id === guild.roles.everyone.id) return ['everyone'];
  const config = architecture.roles.find((item) => (
    item.name === role.name || (item.aliases || []).includes(role.name)
  ));
  return config ? [config.key] : [];
}

function findRoleByKey(guild, roleKey) {
  const config = architecture.roles.find((role) => role.key === roleKey);
  if (!config) return null;
  const names = new Set([config.name, ...(config.aliases || [])]);
  return guild.roles.cache.find((role) => names.has(role.name)) || null;
}

function buildMatrixRolePlan(guild, requestedById) {
  const warnings = [];
  const actions = [];
  const managedCategories = [];
  const publicCategories = [];
  const adminRoles = ['owner', 'admin', 'mod'].map((key) => findRoleByKey(guild, key)).filter(Boolean);
  let adminCategoryName = null;

  for (const category of [...guild.channels.cache.values()].filter((channel) => channel.type === ChannelType.GuildCategory)) {
    const categoryKey = resolveCategoryKey(category);
    if (!categoryKey) continue;
    managedCategories.push(category.name);
    if (categoryKey === 'admin') adminCategoryName = category.name;
    const allowedRoleKeys = directRoleKeysForCategory(categoryKey);
    if (allowedRoleKeys.includes('everyone')) publicCategories.push(category.name);
    for (const roleKey of allowedRoleKeys.filter((key) => !['everyone', 'guest', 'owner', 'admin', 'mod'].includes(key))) {
      const role = findRoleByKey(guild, roleKey);
      if (!role) {
        warnings.push(`找不到角色：${roleKey}`);
        continue;
      }
      actions.push({
        type: 'role_category_access',
        roleName: role.name,
        roleId: role.id,
        categoryName: category.name,
        categoryId: category.id
      });
    }
  }

  return {
    guildId: guild.id,
    requestedById,
    createdAt: Date.now(),
    adminRoles: adminRoles.map((role) => ({ id: role.id, name: role.name })),
    adminCategoryName,
    managedCategories,
    publicCategories,
    publicChannels: [],
    actions,
    warnings
  };
}

function inspectRoleVisibility(guild, role) {
  const directRoleKeys = roleKeysForDiscordRole(guild, role);
  const effectiveRoleKeys = expandRoleKeys(directRoleKeys);
  const categories = [...guild.channels.cache.values()].filter((channel) => channel.type === ChannelType.GuildCategory);
  const categoryResults = categories.map((category) => {
    const categoryKey = resolveCategoryKey(category);
    const expectedVisible = categoryKey ? roleCanAccessCategory(effectiveRoleKeys, categoryKey) : false;
    const actualVisible = Boolean(category.permissionsFor(role)?.has(PermissionFlagsBits.ViewChannel));
    return {
      category,
      categoryKey,
      expectedVisible,
      actualVisible,
      reason: !categoryKey
        ? '不在 Permission Matrix 中'
        : expectedVisible && !actualVisible
          ? '矩陣允許，但 Discord overwrite 拒絕或未同步'
          : !expectedVisible && actualVisible
            ? '矩陣不允許，但 Discord overwrite 外漏'
            : expectedVisible ? '矩陣允許' : '矩陣限制'
    };
  });
  const channels = [...guild.channels.cache.values()]
    .filter((channel) => channel.type !== ChannelType.GuildCategory)
    .map((channel) => ({
      channel,
      actualVisible: Boolean(channel.permissionsFor(role)?.has(PermissionFlagsBits.ViewChannel))
    }));
  return { role, directRoleKeys, effectiveRoleKeys, categories: categoryResults, channels };
}

function buildRoleVisibilityEmbed(report) {
  const visibleCategories = report.categories.filter((item) => item.actualVisible);
  const hiddenCategories = report.categories.filter((item) => !item.actualVisible);
  const mismatches = report.categories.filter((item) => item.actualVisible !== item.expectedVisible);
  const visibleChannels = report.channels.filter((item) => item.actualVisible);
  const list = (items, map) => items.length ? items.slice(0, 25).map(map).join('\n').slice(0, 1024) : '無';
  return new EmbedBuilder()
    .setColor(mismatches.length ? 0xf2c94c : 0x57f287)
    .setTitle(`角色可見性：${report.role.name}`)
    .setDescription(`直接角色：${report.directRoleKeys.join(', ') || 'unknown'}\n繼承後：${report.effectiveRoleKeys.join(', ') || 'none'}`)
    .addFields(
      { name: '可見分類', value: list(visibleCategories, (item) => item.category.name) },
      { name: '不可見分類', value: list(hiddenCategories, (item) => item.category.name) },
      { name: '可見頻道', value: list(visibleChannels, (item) => item.channel.name) },
      { name: '被拒絕原因', value: list(hiddenCategories, (item) => `${item.category.name}: ${item.reason}`) },
      { name: '矩陣與 Discord 不一致', value: list(mismatches, (item) => `${item.category.name}: ${item.reason}`) }
    )
    .setTimestamp();
}

function debugPermissions(guild, channel) {
  const category = channel.type === ChannelType.GuildCategory ? channel : channel.parent;
  const categoryKey = resolveCategoryKey(category);
  const matrixRoles = directRoleKeysForCategory(categoryKey);
  const overwrites = [...channel.permissionOverwrites.cache.values()].map((overwrite) => ({
    id: overwrite.id,
    target: guild.roles.cache.get(overwrite.id)?.name || guild.members.cache.get(overwrite.id)?.user?.tag || overwrite.id,
    allow: overwrite.allow.toArray(),
    deny: overwrite.deny.toArray()
  }));
  return { channel, category, categoryKey, matrixRoles, overwrites };
}

function buildDebugPermissionsEmbed(report) {
  const overwriteText = report.overwrites.length
    ? report.overwrites.slice(0, 15).map((item) => (
      `${item.target}\n  allow: ${item.allow.join(', ') || '-'}\n  deny: ${item.deny.join(', ') || '-'}`
    )).join('\n').slice(0, 1024)
    : '沒有明確 overwrite，將繼承上層權限。';
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('Permission Debug')
    .addFields(
      { name: '目前分類', value: report.category?.name || '未分類', inline: true },
      { name: '目前頻道', value: report.channel.name, inline: true },
      { name: 'Permission Matrix', value: `${report.categoryKey || 'unknown'} → ${report.matrixRoles.join(', ') || '未定義'}` },
      { name: '實際 Discord Permission Overwrite', value: overwriteText }
    )
    .setTimestamp();
}

module.exports = {
  buildGuestVisibilityEmbed: require('../../legacy/permissions/guestGate').buildGuestVisibilityEmbed,
  buildOnboardingEmbed: communityBootstrap.buildOnboardingCheckEmbed,
  buildRepairPlan,
  buildRepairEmbed: require('../../systems/layoutDecisionEngine').buildLayoutRepairEmbed,
  buildRolePlan,
  buildRolePlanEmbed: rolePermissions.buildRolePermissionEmbed,
  buildDebugPermissionsEmbed,
  buildRoleVisibilityEmbed,
  debugPermissions,
  inspectGuestGate,
  inspectOnboarding,
  inspectRoleVisibility,
  repairGuestGate: buildRepairPlan,
  saveRepairPlan: require('../../systems/layoutDecisionEngine').saveLayoutRepairPlan,
  saveRolePlan: rolePermissions.saveRolePermissionPlan,
  setChannelLocked
};
