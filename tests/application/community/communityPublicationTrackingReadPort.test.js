const assert = require('node:assert/strict');
const {
  CommunityPublicationTrackingPublications,
  assertCommunityPublicationTrackingReadPort,
  createCommunityPublicationTrackingReadRequest,
  createCommunityPublicationTrackingReadResult
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');

assert.deepEqual(CommunityPublicationTrackingPublications, ['guide', 'roadmap']);

for (const publication of CommunityPublicationTrackingPublications) {
  const guildId = { exact: publication };
  const request = createCommunityPublicationTrackingReadRequest({ guildId, publication });
  assert.strictEqual(request.guildId, guildId, 'guildId must be passed through unchanged');
  assert.equal(request.publication, publication);
  assert.equal(Object.isFrozen(request), true);
}

for (const publication of ['Guide', 'RoadMap', 'unknown', '', null, undefined]) {
  assert.throws(
    () => createCommunityPublicationTrackingReadRequest({ guildId: 'guild-1', publication }),
    new Error(`Unsupported publication: ${publication}`)
  );
}

const trackedMessageId = { malformed: true };
const result = createCommunityPublicationTrackingReadResult({ trackedMessageId });
assert.deepEqual(Object.keys(result), ['trackedMessageId']);
assert.strictEqual(result.trackedMessageId, trackedMessageId);
assert.equal(Object.isFrozen(result), true);
assertCommunityPublicationTrackingReadPort({ readTrackedMessage() {} });
assert.throws(() => assertCommunityPublicationTrackingReadPort({}), /readTrackedMessage method/);

console.log('Community publication tracking read port preserves its narrow frozen contract.');
