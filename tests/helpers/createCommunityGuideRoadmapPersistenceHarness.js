const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createCommunityGuideRoadmapPersistenceHarness({ initial = {}, raw, readFails = false, writeFails = false } = {}) {
  let state = clone(initial);
  let content = raw === undefined ? JSON.stringify(state) : raw;
  let exists = raw !== undefined || Object.keys(initial).length > 0;
  const log = { calls: [], writes: [], errors: [] };

  function read() {
    log.calls.push('read');
    if (readFails) throw new Error('read failure');
    if (!exists) return {};
    try {
      const parsed = JSON.parse(content || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      log.errors.push(error.message);
      return {};
    }
  }

  function patch(guildId, changes, timestamp = '2026-07-25T00:00:00.000Z') {
    const data = read();
    data[guildId] = { ...(data[guildId] || {}), ...changes, updatedAt: timestamp };
    const next = `${JSON.stringify(data, null, fixture.formatting.indentation)}\n`;
    log.calls.push('write');
    log.writes.push(next);
    if (writeFails) {
      log.errors.push('write failure');
      return { persisted: false, record: data[guildId] };
    }
    exists = true;
    content = next;
    state = clone(data);
    return { persisted: true, record: data[guildId] };
  }

  return { read, patch, log, getState: () => clone(state), getContent: () => content };
}

module.exports = { createCommunityGuideRoadmapPersistenceHarness };
