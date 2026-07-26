const { fromLegacyPublicationRecord } = require('../../src/application/community');

function legacyDecision(record, mode = 'create') {
  const guideMessageId = record && record.guideMessageId;
  return { branch: guideMessageId && mode !== 'force' ? 'fetch-existing' : 'send-new', guideMessageId: guideMessageId || null };
}

function integratedDecision(guildId, record, mode = 'create') {
  const source = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
  const state = fromLegacyPublicationRecord(guildId, source);
  const guideMessageId = state.guide.messageId || source.guideMessageId;
  return { branch: guideMessageId && mode !== 'force' ? 'fetch-existing' : 'send-new', guideMessageId: guideMessageId || null, state };
}

function legacyRoadmapDecision(record) {
  const roadmapMessageId = record && record.roadmapMessageId;
  return { branch: roadmapMessageId ? 'fetch-existing' : 'send-new', roadmapMessageId: roadmapMessageId || null };
}

function integratedRoadmapDecision(guildId, record) {
  const source = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
  const state = fromLegacyPublicationRecord(guildId, source);
  const roadmapMessageId = state.roadmap.messageId || source.roadmapMessageId;
  return { branch: roadmapMessageId ? 'fetch-existing' : 'send-new', roadmapMessageId: roadmapMessageId || null, state };
}

module.exports = { integratedDecision, integratedRoadmapDecision, legacyDecision, legacyRoadmapDecision };
