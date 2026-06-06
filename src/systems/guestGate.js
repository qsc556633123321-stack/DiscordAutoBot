const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { COMMUNITY_LAYOUT } = require('../config/communityLayout');
const { VISIBILITY_TYPES } = require('../config/channelVisibilityRules');
const { normalizeChannelName } = require('./communityBootstrapSystem');
const { isTempVoice } = require('./tempVoice');

const PUBLIC_CATEGORY_KEYS = new Set(['entry', 'support']);
const PUBLIC_CHANNEL_KEYS = new Set(['welcome', 'rules', 'announcement', 'server_guide', 'role_select', 'open_ticket']);
const FORMAL_CATEGORY_KEYS = new Set(['public_lobby', 'game_center', 'interest_zone']);
const ROLE_CATEGORY_KEYS = new Map([
  ['creative_dev', '🛠 開發/AI'],
  ['invest', '📈 股票投資'],
  ['night_crew', '🌙 Night Crew']
]);

function matchesConfig(channel, config) {
  const names = [config.key, config.name, ...(config.aliases || [])].map(normalizeChannelName);
  return names.includes(normalizeChannelName(channel.name));
}

function findLayoutRecord(channel) {
  for (const category of COMMUNITY_LAYOUT) {
    if (channel.type === ChannelType.GuildCategory && matchesConfig(channel, category)) {
      return { kind: 'category', category, spec: category };
    }
    for (const spec of category.channels || []) {
      if (matchesConfig(channel, spec)) return { kind: 'channel', category, spec };
    }
  }
  return null;
}

function isGameCategory(channel) {
  if (channel.type !== ChannelType.GuildCategory) return false;
  const record = findLayoutRecord(channel);
  if (record?.category?.key?.startsWith('game_') && record.category.key !== 'game_center') return true;
  return /^🎮[｜|]/u.test(channel.name) && !/遊戲中心|遊戲大廳/u.test(channel.name);
}

function ruleForChannel(channel) {
  if (channel.name?.startsWith('ticket-')) return null;
  if (channel.guild && isTempVoice(channel.guild.id, channel.id)) return null;
  if (/Night Crew/u.test(channel.name) || /Night Crew/u.test(channel.parent?.name || '')) {
    return { visibilityType: VISIBILITY_TYPES.hiddenSpecial, roleName: '🌙 Night Crew', specialRoleName: '🌙 Night Crew', label: 'Night Crew 限定' };
  }
  if (/創作與開發/u.test(channel.name) || /創作與開發/u.test(channel.parent?.name || '')) {
    return { visibilityType: VISIBILITY_TYPES.roleRestricted, roleName: '🛠 開發/AI', label: '開發身分組限定' };
  }
  if (/投資討論/u.test(channel.name) || /投資討論/u.test(channel.parent?.name || '')) {
    return { visibilityType: VISIBILITY_TYPES.roleRestricted, roleName: '📈 股票投資', label: '投資身分組限定' };
  }
  const record = findLayoutRecord(channel);
  const categoryKey = record?.category?.key;
  const channelKey = record?.kind === 'channel' ? record.spec.key : null;

  if (channelKey && PUBLIC_CHANNEL_KEYS.has(channelKey)) {
    return {
      visibilityType: ['announcement', 'server_guide'].includes(channelKey)
        ? VISIBILITY_TYPES.semiPublicReadonly
        : VISIBILITY_TYPES.publicEntry,
      label: '入口公開頻道'
    };
  }
  if (record?.kind === 'category' && PUBLIC_CATEGORY_KEYS.has(categoryKey)) {
    return { visibilityType: VISIBILITY_TYPES.publicEntry, label: '入口公開分類' };
  }
  if (record?.kind === 'channel' && PUBLIC_CATEGORY_KEYS.has(categoryKey)) {
    return { visibilityType: VISIBILITY_TYPES.formalMemberVisible, label: '非入口公開頻道，正式成員限定' };
  }
  if (isGameCategory(channel) || (channel.parent && isGameCategory(channel.parent))) {
    return { visibilityType: VISIBILITY_TYPES.roleRestricted, roleName: '🎮 遊戲玩家', label: '遊戲身分組限定' };
  }
  if (ROLE_CATEGORY_KEYS.has(categoryKey)) {
    const roleName = ROLE_CATEGORY_KEYS.get(categoryKey);
    return {
      visibilityType: categoryKey === 'night_crew' ? VISIBILITY_TYPES.hiddenSpecial : VISIBILITY_TYPES.roleRestricted,
      roleName,
      specialRoleName: roleName,
      label: `${roleName} 限定`
    };
  }
  if (categoryKey === 'admin') return { visibilityType: VISIBILITY_TYPES.privateAdmin, label: '管理員限定' };
  if (categoryKey === 'old_archive') return { visibilityType: VISIBILITY_TYPES.archive, label: '封存限定' };
  if (FORMAL_CATEGORY_KEYS.has(categoryKey)) {
    return { visibilityType: VISIBILITY_TYPES.formalMemberVisible, label: '正式成員限定' };
  }

  if (/熱門遊戲|其他遊戲|興趣交流|社群大廳|遊戲中心/u.test(channel.name)) {
    return { visibilityType: VISIBILITY_TYPES.formalMemberVisible, label: '正式成員限定' };
  }
  if (/管理員後台|server-logs|ticket-logs|bot-control|語音控制台/u.test(channel.name)) {
    return { visibilityType: VISIBILITY_TYPES.privateAdmin, label: '管理員限定' };
  }
  if (/舊頻道封存|遊戲封存區/u.test(channel.name)) return { visibilityType: VISIBILITY_TYPES.archive, label: '封存限定' };
  return { visibilityType: VISIBILITY_TYPES.privateAdmin, label: '未分類頻道，預設對新人隱藏' };
}

function canRoleView(channel, role) {
  return Boolean(role && channel.permissionsFor(role)?.has(PermissionFlagsBits.ViewChannel));
}

function mustForceGuestHidden(channel) {
  const record = findLayoutRecord(channel);
  return record?.category?.key === 'game_center' ||
    record?.spec?.key === 'voice_hub' ||
    isGameCategory(channel) ||
    Boolean(channel.parent && isGameCategory(channel.parent));
}

function checkGuestVisibility(guild) {
  const guestRole = guild.roles.cache.find((role) => ['👤 訪客', '訪客'].includes(role.name)) || null;
  return [...guild.channels.cache.values()].map((channel) => {
    const rule = ruleForChannel(channel);
    if (!rule) return null;
    const shouldBeVisible = [VISIBILITY_TYPES.publicEntry, VISIBILITY_TYPES.semiPublicReadonly].includes(rule.visibilityType);
    const everyoneVisible = canRoleView(channel, guild.roles.everyone);
    const guestVisible = guestRole ? canRoleView(channel, guestRole) : everyoneVisible;
    return {
      channel,
      rule,
      shouldBeVisible,
      everyoneVisible,
      guestVisible,
      forceHidden: mustForceGuestHidden(channel),
      leaked: !shouldBeVisible && (everyoneVisible || guestVisible),
      missing: shouldBeVisible && (!everyoneVisible || !guestVisible)
    };
  }).filter(Boolean);
}

async function checkNativeOnboardingReferences(guild) {
  const references = [];
  try {
    const onboarding = await guild.fetchOnboarding();
    for (const [channelId, channel] of onboarding.defaultChannels) {
      const resolved = channel || guild.channels.cache.get(channelId);
      const rule = resolved ? ruleForChannel(resolved) : null;
      if (resolved && ![VISIBILITY_TYPES.publicEntry, VISIBILITY_TYPES.semiPublicReadonly].includes(rule?.visibilityType)) {
        references.push({
          channel: resolved,
          source: 'Discord Onboarding 預設頻道',
          warning: '此頻道若被 Discord 原生導覽任務使用，可能必須對 @everyone 可見'
        });
      }
    }
    for (const prompt of onboarding.prompts.values()) {
      for (const option of prompt.options.values()) {
        for (const [channelId, channel] of option.channels) {
          const resolved = channel || guild.channels.cache.get(channelId);
          const rule = resolved ? ruleForChannel(resolved) : null;
          if (resolved && ![VISIBILITY_TYPES.publicEntry, VISIBILITY_TYPES.semiPublicReadonly].includes(rule?.visibilityType)) {
            references.push({
              channel: resolved,
              source: `Discord Onboarding 任務：${prompt.title}`,
              warning: '此頻道若被 Discord 原生導覽任務使用，可能必須對 @everyone 可見'
            });
          }
        }
      }
    }
  } catch (error) {
    return { references: [], fetchWarning: `無法讀取 Discord 原生 Onboarding 設定：${error.message}` };
  }
  const unique = new Map();
  for (const item of references) unique.set(`${item.channel.id}:${item.source}`, item);
  return { references: [...unique.values()], fetchWarning: null };
}

function buildGuestGatePlan(guild, options = {}) {
  return {
    id: options.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    guildId: guild.id,
    requestedById: options.requestedById,
    scope: 'guest_gate',
    optimizationMode: 'conservative',
    mode: options.mode || 'preview',
    createdAt: Date.now(),
    actions: checkGuestVisibility(guild)
      .filter((item) => item.leaked || item.missing || item.forceHidden || options.includeHealthy)
      .map((item) => ({
        action: 'sync_permission',
        type: 'sync_permission',
        targetId: item.channel.id,
        targetName: item.channel.name,
        visibilityType: item.rule.visibilityType,
        roleName: item.rule.roleName,
        specialRoleName: item.rule.specialRoleName,
        reason: item.leaked
          ? 'Guest Gate 外漏，將關閉新人可見性'
          : item.missing
            ? '入口頻道不可見，將恢復新人可見性'
            : item.forceHidden
              ? 'Guest Gate 強制保護遊戲中心、目前語音房與遊戲分類'
              : 'Guest Gate 權限同步',
        confidence: 100,
        risk: 'medium',
        requiresConfirmation: true
      }))
  };
}

function buildGuestVisibilityEmbed(results, nativeOnboarding = { references: [], fetchWarning: null }) {
  const visible = results.filter((item) => item.shouldBeVisible && !item.missing);
  const leaked = results.filter((item) => item.leaked);
  const missing = results.filter((item) => item.missing);
  const list = (items, mapper) => items.length ? items.slice(0, 20).map(mapper).join('\n').slice(0, 1024) : '無';
  return new EmbedBuilder()
    .setColor(leaked.length || missing.length || nativeOnboarding.references?.length ? 0xed4245 : 0x57f287)
    .setTitle('🚪 Guest Gate Visibility Check')
    .setDescription('以 @everyone 與訪客身分檢查頻道可見性。')
    .addFields(
      { name: '✅ 應該可見', value: list(visible, (item) => item.channel.name) },
      { name: '❌ 不該可見但外漏', value: list(leaked, (item) => `${item.channel.name} - ${item.rule.label}`) },
      { name: '⚠️ 應該可見但看不到', value: list(missing, (item) => item.channel.name) },
      {
        name: '🧭 Discord 原生導覽衝突',
        value: list(nativeOnboarding.references || [], (item) => `${item.channel.name} - ${item.source}\n${item.warning}`)
      },
      ...(nativeOnboarding.fetchWarning ? [{ name: '原生導覽檢查提醒', value: nativeOnboarding.fetchWarning.slice(0, 1024) }] : [])
    )
    .setTimestamp();
}

module.exports = {
  buildGuestGatePlan,
  buildGuestVisibilityEmbed,
  checkGuestVisibility,
  checkNativeOnboardingReferences,
  ruleForChannel
};
