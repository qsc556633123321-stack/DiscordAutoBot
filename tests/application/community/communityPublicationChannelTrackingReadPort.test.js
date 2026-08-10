const assert = require('node:assert/strict');
const {
  CommunityPublicationChannelTrackingPublications,
  assertCommunityPublicationChannelTrackingReadPort,
  createCommunityPublicationChannelTrackingReadRequest,
  createCommunityPublicationChannelTrackingReadResult
} = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');

assert.deepEqual(CommunityPublicationChannelTrackingPublications, ['guide']);
const request = createCommunityPublicationChannelTrackingReadRequest({ guildId: '  guild-id  ', publication: 'guide' });
assert.deepEqual(request, { guildId: '  guild-id  ', publication: 'guide' });
assert.equal(Object.isFrozen(request), true);
for (const publication of ['roadmap', 'Guide', '', null, undefined]) {
  assert.throws(() => createCommunityPublicationChannelTrackingReadRequest({ guildId: 'guild-id', publication }), new Error(`Unsupported publication: ${publication}`));
}
const rawChannelId = { legacy: 'truthy' };
const result = createCommunityPublicationChannelTrackingReadResult({ trackedChannelId: rawChannelId });
assert.deepEqual(Object.keys(result), ['trackedChannelId']);
assert.strictEqual(result.trackedChannelId, rawChannelId);
assert.equal(Object.isFrozen(result), true);
assert.doesNotThrow(() => assertCommunityPublicationChannelTrackingReadPort({ readTrackedChannel() {} }));
assert.throws(() => assertCommunityPublicationChannelTrackingReadPort({}), /readTrackedChannel/);
console.log('Community publication channel tracking read port preserves its narrow frozen contract.');
