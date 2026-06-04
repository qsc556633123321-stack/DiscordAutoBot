const COMMUNITY_RULES_VERSION = 'v1';

const CATEGORY_TYPES = {
  onboarding: {
    label: '社群入口',
    channels: ['新人報到', '社群規則', '公告', '伺服器導覽', '身分組領取'],
    protectedActions: ['move', 'archive', 'delete'],
    protected: true
  },
  social: {
    label: '社群大廳',
    channels: ['一般聊天', '深夜聊天', '認真討論', '找隊友大廳', '目前語音房'],
    protectedActions: ['archive', 'delete']
  },
  game_center: {
    label: '遊戲中心',
    channels: ['組隊招募', '目前語音房', '遊戲提議'],
    protectedActions: ['delete']
  },
  dynamic_game: {
    label: '動態遊戲分類',
    channels: ['聊天', '找隊友', '資訊', '建立語音'],
    protectedActions: ['archive', 'delete'],
    childPurposes: ['聊天', '找隊友', '資訊', '建立語音']
  },
  hobby: {
    label: '興趣交流',
    channels: ['音樂分享', '美食分享', '迷因與好圖'],
    protectedActions: ['archive', 'delete'],
    allowedActions: ['keep', 'move', 'move_to_hobby']
  },
  development: {
    label: '創作與開發',
    channels: ['程式開發', 'AI工具', '設計作品', '作品展示'],
    protectedActions: ['archive', 'delete']
  },
  investment: {
    label: '投資討論',
    channels: ['盤勢討論', '投資筆記'],
    protectedActions: []
  },
  events: {
    label: '活動專區',
    channels: ['活動公告', '投票區', '抽獎活動', '比賽與排行'],
    protectedActions: ['delete']
  },
  admin: {
    label: '管理員後台',
    channels: ['server-logs', 'ticket-logs', 'bot-control', '語音控制台', '整理紀錄'],
    protectedActions: ['move', 'archive', 'delete'],
    protected: true
  }
};

const ALLOWED_RENAMES = [
  { from: 'ai工具', to: 'AI工具' },
  { from: '股票ai工具', to: '股票AI工具' },
  { from: '閒聊討論', to: '認真討論' }
];

const PROHIBITED_RENAMES = [
  { from: 'VALORANT', to: '特戰' },
  { from: 'APEX', to: 'Apex區' },
  { from: 'Minecraft', to: 'MC' }
];

const DUPLICATE_PAIRS = [
  ['一般聊天', '閒聊討論'],
  ['組隊招募', '找隊友大廳']
];

const ARCHIVE_PREFIXES = ['test-', 'old-', 'delete-pending', 'temp-'];

function normalizeRuleName(value = '') {
  return String(value)
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[｜|_\-\s#🔊🎤📢📋📦✅📜👋🧭💬🌙🧠🎮🎵🍜🖼🧑‍🤝‍🧑📌🤖🧑‍💻🎨📁📈📊🗳🎁🏆🔒⚙️]/gu, '')
    .toLowerCase()
    .trim();
}

function includesRuleName(source, keyword) {
  return normalizeRuleName(source).includes(normalizeRuleName(keyword));
}

function getActionType(action) {
  return action?.action || action?.type || 'keep';
}

function classifyChannelByRules(input = {}) {
  const name = input.name || input.channel?.name || input.targetName || '';
  const parentName = input.parentName || input.channel?.parent?.name || input.categoryName || '';
  const metadata = input.metadata || input.dynamicGame || null;

  if (metadata?.type === 'dynamic_game' || input.semanticType === 'dynamic_game') {
    return { categoryType: 'dynamic_game', protected: true, reason: 'Community Rules v1: dynamic_game protected' };
  }

  if (includesRuleName(parentName, '🎮') && /聊天|找隊友|資訊|建立.*語音/.test(name)) {
    return { categoryType: 'dynamic_game', protected: true, reason: 'Community Rules v1: game child protected' };
  }

  for (const [categoryType, rule] of Object.entries(CATEGORY_TYPES)) {
    if (categoryType === 'dynamic_game') continue;
    if (rule.channels.some((keyword) => includesRuleName(name, keyword))) {
      return {
        categoryType,
        protected: Boolean(rule.protected || rule.protectedActions?.length),
        reason: `Community Rules v1: ${rule.label}`
      };
    }
  }

  return { categoryType: 'unknown', protected: false, reason: 'Community Rules v1: unknown' };
}

function isAllowedRename(oldName = '', newName = '', context = {}) {
  const from = normalizeRuleName(oldName);
  const to = normalizeRuleName(newName);

  if (from === to && oldName !== newName) return true;

  if (ALLOWED_RENAMES.some((rule) => from === normalizeRuleName(rule.from) && to === normalizeRuleName(rule.to))) {
    return true;
  }

  if (context.categoryType === 'dynamic_game' && context.dynamicGameDisplayName) {
    return includesRuleName(newName, context.dynamicGameDisplayName) ||
      ['聊天', '找隊友', '資訊', '建立語音'].some((keyword) => includesRuleName(newName, keyword));
  }

  return false;
}

function isProhibitedRename(oldName = '', newName = '') {
  const from = normalizeRuleName(oldName);
  const to = normalizeRuleName(newName);
  return PROHIBITED_RENAMES.some((rule) => (
    from.includes(normalizeRuleName(rule.from)) &&
    to.includes(normalizeRuleName(rule.to))
  ));
}

function isAllowedDuplicatePair(a = '', b = '') {
  const left = normalizeRuleName(a);
  const right = normalizeRuleName(b);
  return DUPLICATE_PAIRS.some(([one, two]) => {
    const n1 = normalizeRuleName(one);
    const n2 = normalizeRuleName(two);
    return (left.includes(n1) && right.includes(n2)) || (left.includes(n2) && right.includes(n1));
  });
}

function isArchivePrefixAllowed(name = '') {
  const lower = String(name).toLowerCase();
  return ARCHIVE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function validateLayoutAction(action, context = {}) {
  const type = getActionType(action);
  if (type === 'keep') return { allowed: true, reason: 'keep' };

  const classification = classifyChannelByRules({
    name: action.targetName || action.name,
    parentName: context.channel?.parent?.name || action.parentName,
    channel: context.channel,
    metadata: context.dynamicGame || action.dynamicGame,
    semanticType: action.semanticType || action.classification
  });
  const rule = CATEGORY_TYPES[classification.categoryType];
  const targetName = action.targetName || context.channel?.name || '';

  if (rule?.protectedActions?.includes(type)) {
    if (type === 'archive' && action.classification === 'duplicate_game_category') {
      return { allowed: true, reason: 'Community Rules v1 validated duplicate_game_category', categoryType: classification.categoryType };
    }
    return { allowed: false, reason: `${classification.reason} 不允許 ${type}` };
  }

  if (classification.categoryType === 'hobby' && !['keep', 'move', 'move_to_hobby', 'sync_permission'].includes(type)) {
    return { allowed: false, reason: 'Community Rules v1: hobby 不可 duplicate/archive/delete，只能 keep 或 move_to_hobby' };
  }

  if ((action.classification === 'duplicate_channel' || /duplicate|相似|重複/i.test(action.reason || '')) &&
      !isAllowedDuplicatePair(targetName, action.targetName === action.newName ? '' : (action.newName || action.reason || ''))) {
    if (type === 'archive' || type === 'delete') {
      return { allowed: false, reason: 'Community Rules v1: 此頻道不在允許 duplicate 清單內' };
    }
  }

  if (type === 'rename') {
    if (isProhibitedRename(targetName, action.newName || '')) {
      return { allowed: false, reason: 'Community Rules v1: 禁止 alias 反向覆蓋 displayName' };
    }
    if (!isAllowedRename(targetName, action.newName || '', {
      categoryType: classification.categoryType,
      dynamicGameDisplayName: action.displayName || action.gameDisplayName || context.dynamicGame?.displayName
    })) {
      return { allowed: false, reason: 'Community Rules v1: rename 不在允許清單內' };
    }
  }

  if (type === 'archive') {
    const dead = action.classification === 'dead_channel' || /dead|死亡|無近期活動|用途不明/i.test(action.reason || '');
    if (!isArchivePrefixAllowed(targetName) && !dead) {
      return { allowed: false, reason: 'Community Rules v1: 只有 test-/old-/delete-pending/temp- 或 dead channel 可封存' };
    }
  }

  if (type === 'delete') {
    const dead = action.classification === 'dead_channel' || /dead|死亡/i.test(action.reason || '');
    const protectedType = ['onboarding', 'dynamic_game', 'admin'].includes(classification.categoryType);
    if (!dead || protectedType) {
      return { allowed: false, reason: 'Community Rules v1: delete 必須 dead 且非 protected/dynamic_game/onboarding' };
    }
  }

  return { allowed: true, reason: 'Community Rules v1 validated', categoryType: classification.categoryType };
}

function applyCommunityRulesToActions(actions = [], context = {}) {
  return actions.map((item) => {
    const validation = validateLayoutAction(item, context);
    if (validation.allowed) {
      return { ...item, communityRulesVersion: COMMUNITY_RULES_VERSION };
    }
    return {
      ...item,
      action: 'keep',
      type: 'keep',
      risk: 'low',
      requiresConfirmation: false,
      rejectedAction: getActionType(item),
      communityRulesVersion: COMMUNITY_RULES_VERSION,
      reason: `${validation.reason}；已拒絕原動作 ${getActionType(item)}`
    };
  });
}

module.exports = {
  ALLOWED_RENAMES,
  ARCHIVE_PREFIXES,
  CATEGORY_TYPES,
  COMMUNITY_RULES_VERSION,
  DUPLICATE_PAIRS,
  PROHIBITED_RENAMES,
  applyCommunityRulesToActions,
  classifyChannelByRules,
  isAllowedDuplicatePair,
  isAllowedRename,
  isArchivePrefixAllowed,
  isProhibitedRename,
  normalizeRuleName,
  validateLayoutAction
};
