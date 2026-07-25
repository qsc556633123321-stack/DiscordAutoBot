const { toLegacyPublicationPatch } = require('./communityPublicationStateMapper');

function applyPublicationPatch(legacyRoot, state) {
  const root = legacyRoot && typeof legacyRoot === 'object' && !Array.isArray(legacyRoot) ? legacyRoot : {};
  const patch = toLegacyPublicationPatch(state);
  return Object.freeze({
    ...root,
    [state.guildId]: Object.freeze({ ...(root[state.guildId] || {}), ...patch })
  });
}

module.exports = { applyPublicationPatch };
