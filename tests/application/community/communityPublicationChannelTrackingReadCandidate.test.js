const assert = require('node:assert/strict');
const {
  CommunityPublicationChannelTrackingPublications,
  createCommunityPublicationChannelTrackingReadRequest,
  createCommunityPublicationChannelTrackingReadResult
} = require('../../fakes/community/FakeCommunityPublicationChannelTrackingReadPort');

assert.deepEqual(CommunityPublicationChannelTrackingPublications, ['guide']);
const request = createCommunityPublicationChannelTrackingReadRequest({ guildId: '  guild-id  ', publication: 'guide' });
assert.deepEqual(request, { guildId: '  guild-id  ', publication: 'guide' });
assert.equal(Object.isFrozen(request), true);
for (const publication of ['Guide', 'roadmap', '', null, undefined]) {
  assert.throws(() => createCommunityPublicationChannelTrackingReadRequest({ guildId: 'guild-id', publication }), new Error(`Unsupported publication: ${publication}`));
}
const rawChannelId = { legacy: 'truthy' };
const result = createCommunityPublicationChannelTrackingReadResult({ trackedChannelId: rawChannelId });
assert.deepEqual(Object.keys(result), ['trackedChannelId']);
assert.strictEqual(result.trackedChannelId, rawChannelId);
assert.equal(Object.isFrozen(result), true);
console.log('Welcome channel tracking read candidate is narrow, exact, frozen, and raw-record free.');
