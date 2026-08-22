const GAME_REGISTRY = require('./gameRegistry');
const { getGameRoleKey } = require('./gameAccessPolicy');

function deriveGameRoleSelectionPlan({ currentRoleKeys = [], selectedGameIds = [], gameRegistry = GAME_REGISTRY } = {}) {
  const knownIds = new Set(gameRegistry.map((game) => game.id));
  const selected = new Set(selectedGameIds);
  const unknownGameIds = [...selected].filter((gameId) => !knownIds.has(gameId));
  if (unknownGameIds.length) return Object.freeze({ ok: false, code: 'UNKNOWN_GAME_ID', unknownGameIds: Object.freeze(unknownGameIds) });

  const current = new Set(currentRoleKeys.filter((roleKey) => typeof roleKey === 'string' && roleKey.startsWith('game:')));
  const desired = new Set([...selected].map(getGameRoleKey));
  const addRoleKeys = [...desired].filter((roleKey) => !current.has(roleKey));
  const removeRoleKeys = [...current].filter((roleKey) => !desired.has(roleKey));
  const unchangedRoleKeys = [...desired].filter((roleKey) => current.has(roleKey));
  return Object.freeze({
    ok: true,
    addRoleKeys: Object.freeze(addRoleKeys),
    removeRoleKeys: Object.freeze(removeRoleKeys),
    unchangedRoleKeys: Object.freeze(unchangedRoleKeys)
  });
}

module.exports = { deriveGameRoleSelectionPlan };
