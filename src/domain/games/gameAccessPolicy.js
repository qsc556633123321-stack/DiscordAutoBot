const GAME_REGISTRY = require('./gameRegistry');

const GAME_PARENT_ROLE_KEY = 'game';
const MEMBER_ROLE_KEY = 'member';
const ADMIN_ROLE_KEYS = Object.freeze(new Set(['owner', 'admin', 'mod']));
const GAME_ROLE_PREFIX = 'game:';
const CANONICAL_GAME_ID_PATTERN = /^[a-z][a-z0-9_]*$/u;

function isCanonicalGameId(gameId) {
  return typeof gameId === 'string' && CANONICAL_GAME_ID_PATTERN.test(gameId);
}

function getGameRoleKey(gameId) {
  return isCanonicalGameId(gameId) ? GAME_ROLE_PREFIX + gameId : null;
}

function getGameIdFromRoleKey(roleKey) {
  if (typeof roleKey !== 'string' || !roleKey.startsWith(GAME_ROLE_PREFIX)) return null;
  const gameId = roleKey.slice(GAME_ROLE_PREFIX.length);
  return isCanonicalGameId(gameId) ? gameId : null;
}

function isGameRoleKey(roleKey) {
  return getGameIdFromRoleKey(roleKey) !== null;
}

function findRegistryGame(game) {
  const gameId = typeof game === 'string' ? game : game?.id;
  return GAME_REGISTRY.find((entry) => entry.id === gameId) || null;
}

function getGameRoleName(game) {
  const registryGame = findRegistryGame(game);
  const identity = registryGame || (game && typeof game === 'object' ? game : null);
  if (!identity?.id || !identity?.displayName) return null;
  return (identity.emoji || '🎮') + ' ' + identity.displayName;
}

function expandGameRoleKeys(roleKeys = []) {
  const expanded = new Set();
  for (const roleKey of roleKeys) {
    if (typeof roleKey === 'string') expanded.add(roleKey);
  }

  if ([...expanded].some((roleKey) => isGameRoleKey(roleKey))) {
    expanded.add(GAME_PARENT_ROLE_KEY);
  }
  if (expanded.has(GAME_PARENT_ROLE_KEY)) {
    expanded.add(MEMBER_ROLE_KEY);
  }

  return [...expanded];
}

function roleCanAccessGame(roleKeys, gameId) {
  const gameRoleKey = getGameRoleKey(gameId);
  return gameRoleKey !== null && new Set(expandGameRoleKeys(roleKeys)).has(gameRoleKey);
}

function roleCanAccessGameCenter(roleKeys) {
  const expanded = new Set(expandGameRoleKeys(roleKeys));
  return expanded.has(GAME_PARENT_ROLE_KEY) || [...expanded].some((roleKey) => ADMIN_ROLE_KEYS.has(roleKey));
}

module.exports = {
  GAME_PARENT_ROLE_KEY,
  GAME_ROLE_PREFIX,
  MEMBER_ROLE_KEY,
  expandGameRoleKeys,
  getGameIdFromRoleKey,
  getGameRoleKey,
  getGameRoleName,
  isGameRoleKey,
  roleCanAccessGame,
  roleCanAccessGameCenter
};
