const { GAME_REGISTRY } = require('../config/gameRegistry');

function normalizeGameName(inputName = '') {
  return String(inputName || '')
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/^🎮\s*[｜|\-_\s]*/u, '')
    .replace(/[｜|_\-\s]+/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function stripGameCategoryPrefix(inputName = '') {
  return String(inputName || '').trim().replace(/^🎮\s*[｜|]\s*/u, '').trim();
}

function sanitizeGameId(inputName = '') {
  return String(inputName || '')
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_')
    .slice(0, 48);
}

function stableHash(inputName = '') {
  let hash = 5381;
  for (const char of String(inputName || '')) {
    hash = ((hash << 5) + hash) + char.codePointAt(0);
    hash >>>= 0;
  }
  return hash.toString(36);
}

function registryNames(game) {
  return [game.displayName, game.id, ...(game.aliases || [])];
}

function findGameIdentity(inputName) {
  const displayInput = stripGameCategoryPrefix(inputName);
  const normalized = normalizeGameName(displayInput);
  if (!normalized) {
    return {
      id: `custom_game_${Date.now()}`,
      displayName: '未命名遊戲',
      aliases: [],
      emoji: '🎮',
      tier: 'other',
      custom: true
    };
  }

  const found = GAME_REGISTRY.find((game) => (
    registryNames(game).some((name) => normalizeGameName(name) === normalized)
  ));
  if (found) return { ...found, custom: false };

  const sanitized = sanitizeGameId(displayInput);
  return {
    id: sanitized ? `custom_${sanitized}` : `custom_game_${stableHash(displayInput)}`,
    displayName: displayInput,
    aliases: [],
    emoji: '🎮',
    tier: 'other',
    custom: true
  };
}

function getCanonicalDisplayName(inputName) {
  return findGameIdentity(inputName).displayName;
}

function getGameId(inputName) {
  return findGameIdentity(inputName).id;
}

function isSameGame(a, b) {
  if (!a || !b) return false;
  return getGameId(a) === getGameId(b);
}

function resolveGameIdentity(inputName) {
  const identity = findGameIdentity(inputName);
  return {
    ...identity,
    slug: identity.id.replace(/_/g, '-'),
    gameId: identity.id
  };
}

module.exports = {
  findGameIdentity,
  getCanonicalDisplayName,
  getGameId,
  isSameGame,
  normalizeGameName,
  resolveGameIdentity,
  sanitizeGameId,
  stableHash,
  stripGameCategoryPrefix
};
