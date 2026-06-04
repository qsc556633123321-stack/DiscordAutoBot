const GAME_ALIAS_SLUGS = {
  '鬥陣特攻2': 'overwatch-2',
  鬥陣特攻: 'overwatch',
  overwatch2: 'overwatch-2',
  'overwatch-2': 'overwatch-2',
  英雄聯盟: 'league-of-legends',
  LOL: 'league-of-legends',
  lol: 'league-of-legends',
  'League of Legends': 'league-of-legends',
  聯盟戰棋: 'teamfight-tactics',
  TFT: 'teamfight-tactics',
  tft: 'teamfight-tactics',
  'Teamfight Tactics': 'teamfight-tactics',
  APEX: 'apex-legends',
  Apex: 'apex-legends',
  'Apex Legends': 'apex-legends',
  VALORANT: 'valorant',
  Valorant: 'valorant',
  特戰英豪: 'valorant',
  特戰: 'valorant',
  Minecraft: 'minecraft',
  minecraft: 'minecraft',
  麥塊: 'minecraft',
  POE: 'path-of-exile',
  PoE: 'path-of-exile',
  'Path of Exile': 'path-of-exile',
  'R.E.P.O': 'repo',
  REPO: 'repo',
  repo: 'repo',
  魔物獵人: 'monster-hunter',
  絕地求生: 'pubg',
  三角洲行動: 'delta-force',
  'Path of Exile 2': 'path-of-exile-2',
  POE2: 'path-of-exile-2',
  poe2: 'path-of-exile-2'
};

function normalizeAlias(value) {
  return String(value || '')
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function sanitizeGameSlug(value) {
  return String(value || '')
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 48);
}

function resolveGameSlug(displayName, options = {}) {
  const normalized = normalizeAlias(displayName);
  const mapping = Object.entries(GAME_ALIAS_SLUGS).find(([alias]) => normalizeAlias(alias) === normalized);
  if (mapping) return mapping[1];

  const sanitized = sanitizeGameSlug(displayName);
  if (sanitized) return sanitized;

  return options.fallback || `game-${Date.now()}`;
}

function resolveGameIdentity(displayName, options = {}) {
  const cleanDisplayName = String(displayName || '').trim() || '未命名遊戲';
  return {
    displayName: cleanDisplayName,
    slug: resolveGameSlug(cleanDisplayName, options)
  };
}

function resolveGameDisplayName(displayName) {
  return String(displayName || '').trim() || '未命名遊戲';
}

module.exports = {
  GAME_ALIAS_SLUGS,
  normalizeAlias,
  resolveGameDisplayName,
  resolveGameIdentity,
  resolveGameSlug,
  sanitizeGameSlug
};
