const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityPublicationIdentityLegacyBaseline');
const { createCommunityPublicationIdentityHarness } = require('../helpers/createCommunityPublicationIdentityHarness');
const channel = { id: 'guide-channel', name: fixture.guide.channelName, messages: { existing: { id: 'existing' } } };
const result = createCommunityPublicationIdentityHarness({ channels: [channel], records: {} }).resolve({ kind: 'guide', name: fixture.guide.channelName, messageField: 'guideMessageId' });
assert.equal(result.action, 'send');
assert.equal(result.message, null, 'existing untracked messages are not reconciled');
console.log('Community publication lost-record recovery baseline tests passed.');
