const {
  findGameIdentity,
  normalizeGameName,
  resolveGameIdentity,
  sanitizeGameId
} = require('../../domain/games/gameIdentityService');
const GAME_REGISTRY = require('../../domain/games/gameRegistry');

const GAME_ALIAS_SLUGS = Object.fromEntries(
  GAME_REGISTRY.flatMap((game) => (
    [game.displayName, game.id, ...(game.aliases || [])].map((alias) => [alias, game.id.replace(/_/g, '-')])
  ))
);

function normalizeAlias(value) {
  return normalizeGameName(value);
}

function sanitizeGameSlug(value) {
  return sanitizeGameId(value).replace(/_/g, '-');
}

function resolveGameSlug(displayName, options = {}) {
  const identity = findGameIdentity(displayName);
  if (!identity.custom) return identity.id.replace(/_/g, '-');
  const sanitized = sanitizeGameSlug(identity.displayName);
  return sanitized || options.fallback || `game-${Date.now()}`;
}

function resolveGameDisplayName(displayName) {
  return resolveGameIdentity(displayName).displayName;
}

module.exports = {
  GAME_ALIAS_SLUGS,
  normalizeAlias,
  resolveGameDisplayName,
  resolveGameIdentity,
  resolveGameSlug,
  sanitizeGameSlug
};
