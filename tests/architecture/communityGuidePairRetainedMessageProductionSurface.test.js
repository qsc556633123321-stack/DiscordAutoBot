const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');
const pair = createGuidePublicationAdapterPair({ ensuredChannel: { id: 'guide', messages: { async fetch() {} }, async send() {} } });
assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort', 'mutationPort']);
for (const key of ['session', 'resource', 'channel', 'message', 'getChannelId', 'lookupTrackedMessage', 'editTrackedMessage', 'sendMessage']) assert.equal(key in pair, false);
console.log('Guide Pair retained-message production surface passed');
