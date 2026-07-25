const { fromLegacyPublicationRecord } = require('../../src/application/community/communityPublicationStateMapper');
const { applyPublicationPatch } = require('../../src/application/community/applyPublicationPatch');
const { applyOperationToState } = require('../../src/application/community/communityPublicationStateOperations');

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function createInMemoryCommunityPublicationStateStore({ root = {}, readError, writeError } = {}) {
  let current = clone(root);
  const calls = [];
  return {
    calls,
    load(guildId) {
      calls.push({ type: 'load', guildId });
      if (readError) throw readError;
      return fromLegacyPublicationRecord(guildId, current[guildId] || {});
    },
    applyPatch(guildId, operation) {
      calls.push({ type: 'applyPatch', guildId, operation });
      if (readError) throw readError;
      const nextState = applyOperationToState(fromLegacyPublicationRecord(guildId, current[guildId] || {}), operation);
      if (writeError) throw writeError;
      current = applyPublicationPatch(current, nextState, operation);
      return nextState;
    },
    getRoot() { return clone(current); }
  };
}

module.exports = { createInMemoryCommunityPublicationStateStore };
