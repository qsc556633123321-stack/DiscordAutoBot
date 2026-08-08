const assert = require('node:assert/strict');
const { createCommunityPublicationStateFilesystemAdapter } = require('../../../src/infrastructure/community/communityPublicationStateFilesystemAdapter');

function createFilesystem({ root = {}, raw, missing = false, writeFails = false } = {}) {
  let content = raw === undefined ? JSON.stringify(root) : raw;
  let fileExists = !missing;
  const calls = [];
  return {
    calls,
    existsSync(target) {
      return target === 'data' ? true : fileExists;
    },
    mkdirSync() {
      calls.push('mkdir');
    },
    readFileSync() {
      calls.push('read');
      return content;
    },
    writeFileSync(target, next) {
      calls.push('write');
      if (writeFails) throw new Error('write failure');
      fileExists = true;
      content = next;
    },
    getRoot() {
      return JSON.parse(content || '{}');
    }
  };
}

const initial = {
  'guild-1': {
    roadmapMessageId: 'roadmap-existing',
    nativeTaskRecommendations: ['entry'],
    unknown: { retained: true }
  },
  'guild-other': { keep: true }
};
const filesystem = createFilesystem({ root: initial });
const adapter = createCommunityPublicationStateFilesystemAdapter({
  filePath: 'onboarding-flows.json',
  dataDirectory: 'data',
  filesystem,
  logger: { error() { throw new Error('unexpected adapter error'); } }
});
adapter.mergeRecord({
  guildId: 'guild-1',
  patch: { guideChannelId: 'guide-next', guideMessageId: 'guide-next-message' },
  updatedAt: '2026-08-08T00:00:00.000Z'
});
adapter.mergeRecord({
  guildId: 'guild-1',
  patch: { roadmapChannelId: 'roadmap-next', roadmapMessageId: 'roadmap-next-message' },
  updatedAt: '2026-08-08T00:01:00.000Z'
});
const sequential = filesystem.getRoot();
assert.deepEqual(filesystem.calls, ['read', 'write', 'read', 'write']);
assert.equal(sequential['guild-1'].guideMessageId, 'guide-next-message');
assert.equal(sequential['guild-1'].roadmapMessageId, 'roadmap-next-message');
assert.deepEqual(sequential['guild-1'].nativeTaskRecommendations, ['entry']);
assert.deepEqual(sequential['guild-1'].unknown, { retained: true });
assert.deepEqual(sequential['guild-other'], { keep: true });

const writeErrors = [];
const failedFilesystem = createFilesystem({ root: { 'guild-1': { unknown: true } }, writeFails: true });
const failed = createCommunityPublicationStateFilesystemAdapter({
  filePath: 'onboarding-flows.json',
  dataDirectory: 'data',
  filesystem: failedFilesystem,
  logger: { error(...args) { writeErrors.push(args); } }
}).mergeRecord({
  guildId: 'guild-1',
  patch: { guideMessageId: 'sent-before-failure' },
  updatedAt: '2026-08-08T00:00:00.000Z'
});
assert.equal(failed.persisted, false);
assert.equal(failed.record.guideMessageId, 'sent-before-failure');
assert.deepEqual(failedFilesystem.getRoot(), { 'guild-1': { unknown: true } });
assert.equal(writeErrors.length, 1);

const malformedErrors = [];
const malformedFilesystem = createFilesystem({ raw: '{not-json' });
const malformed = createCommunityPublicationStateFilesystemAdapter({
  filePath: 'onboarding-flows.json',
  dataDirectory: 'data',
  filesystem: malformedFilesystem,
  logger: { error(...args) { malformedErrors.push(args); } }
}).mergeRecord({
  guildId: 'guild-1',
  patch: { guideMessageId: 'recovered' },
  updatedAt: '2026-08-08T00:00:00.000Z'
});
assert.equal(malformed.persisted, true);
assert.equal(malformedFilesystem.getRoot()['guild-1'].guideMessageId, 'recovered');
assert.equal(malformedErrors.length, 1);

const missingFilesystem = createFilesystem({ missing: true });
createCommunityPublicationStateFilesystemAdapter({
  filePath: 'onboarding-flows.json',
  dataDirectory: 'data',
  filesystem: missingFilesystem,
  logger: { error() {} }
}).mergeRecord({ guildId: 'guild-1', patch: {}, updatedAt: '2026-08-08T00:00:00.000Z' });
assert.deepEqual(missingFilesystem.calls, ['write', 'read', 'write']);

console.log('Community publication filesystem adapter tests passed.');
