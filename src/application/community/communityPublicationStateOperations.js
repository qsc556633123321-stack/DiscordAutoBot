const { createCommunityPublicationState } = require('../../domain/community/communityPublicationState');
const { assertCommunityPublicationStateStore } = require('./ports/communityPublicationStateStore');

function assertId(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value;
}

function createOperation(type, payload = {}) {
  return Object.freeze({ type, ...payload });
}

function loadCommunityPublicationState(store, guildId) {
  assertCommunityPublicationStateStore(store);
  assertId(guildId, 'guildId');
  return store.load(guildId);
}

function setGuidePublication({ guildId, channelId, messageId }) {
  return createOperation('SET_GUIDE_PUBLICATION', { guildId: assertId(guildId, 'guildId'), channelId: assertId(channelId, 'channelId'), messageId: assertId(messageId, 'messageId') });
}

function clearGuidePublication({ guildId }) {
  return createOperation('CLEAR_GUIDE_PUBLICATION', { guildId: assertId(guildId, 'guildId') });
}

function setRoadmapPublication({ guildId, channelId, messageId }) {
  return createOperation('SET_ROADMAP_PUBLICATION', { guildId: assertId(guildId, 'guildId'), channelId: assertId(channelId, 'channelId'), messageId: assertId(messageId, 'messageId') });
}

function clearRoadmapPublication({ guildId }) {
  return createOperation('CLEAR_ROADMAP_PUBLICATION', { guildId: assertId(guildId, 'guildId') });
}

function applyCommunityPublicationOperation(store, operation) {
  assertCommunityPublicationStateStore(store);
  if (!operation || typeof operation.type !== 'string') throw new Error('operation type is required');
  return store.applyPatch(assertId(operation.guildId, 'guildId'), operation);
}

function applyOperationToState(state, operation) {
  const guide = { ...state.guide };
  const roadmap = { ...state.roadmap };
  switch (operation.type) {
    case 'SET_GUIDE_PUBLICATION': guide.channelId = operation.channelId; guide.messageId = operation.messageId; break;
    case 'CLEAR_GUIDE_PUBLICATION': guide.channelId = null; guide.messageId = null; break;
    case 'SET_ROADMAP_PUBLICATION': roadmap.channelId = operation.channelId; roadmap.messageId = operation.messageId; break;
    case 'CLEAR_ROADMAP_PUBLICATION': roadmap.channelId = null; roadmap.messageId = null; break;
    default: throw new Error(`unsupported operation: ${operation.type}`);
  }
  return createCommunityPublicationState({ guildId: state.guildId, guide, roadmap });
}

module.exports = { applyCommunityPublicationOperation, applyOperationToState, clearGuidePublication, clearRoadmapPublication, loadCommunityPublicationState, setGuidePublication, setRoadmapPublication };
