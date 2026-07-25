const { toLegacyPublicationPatch } = require('./communityPublicationStateMapper');

function applyPublicationPatch(legacyRoot, state, operation = {}) {
  const root = legacyRoot && typeof legacyRoot === 'object' && !Array.isArray(legacyRoot) ? legacyRoot : {};
  const patch = toLegacyPublicationPatch(state);
  const nextRecord = { ...(root[state.guildId] || {}), ...patch };

  if (operation.type === 'CLEAR_GUIDE_PUBLICATION') {
    delete nextRecord.guideChannelId;
    delete nextRecord.guideMessageId;
  }

  if (operation.type === 'CLEAR_ROADMAP_PUBLICATION') {
    delete nextRecord.roadmapChannelId;
    delete nextRecord.roadmapMessageId;
  }

  return Object.freeze({
    ...root,
    [state.guildId]: Object.freeze(nextRecord)
  });
}

module.exports = { applyPublicationPatch };
