const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityPublicationIdentityLegacyBaseline');
const { createCommunityPublicationIdentityHarness } = require('../helpers/createCommunityPublicationIdentityHarness');
const channel = { id: 'guide-channel', name: fixture.guide.channelName, messages: { swapped: { id: 'swapped', type: 'roadmap' } } };
const result = createCommunityPublicationIdentityHarness({ channels: [channel], records: { guideMessageId: 'swapped' } }).resolve({ kind: 'guide', name: fixture.guide.channelName, messageField: 'guideMessageId' });
assert.equal(result.action, 'edit');
assert.equal(result.message.type, 'roadmap', 'wrong/swapped records are not detected before edit');
console.log('Community publication wrong-record recovery baseline tests passed.');
