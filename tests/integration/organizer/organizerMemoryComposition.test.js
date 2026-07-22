const assert = require('node:assert/strict');
const { createOrganizerFeature } = require('../../../src/composition/organizerFeature');

const feature = createOrganizerFeature({
  channelRuleReader: { listByGuild: (guildId) => guildId === 'guild' ? [{ keyword: 'A', category: 'B', weight: 5 }] : [] },
  logger: { error: () => {} }
});

assert.equal(typeof feature.createPlan, 'function');
assert.equal(typeof feature.getAIReviewInput, 'function');
assert.deepEqual(feature.channelRuleReader.listByGuild('guild'), [{ keyword: 'A', category: 'B', weight: 5 }]);

console.log('Organizer memory composition tests passed.');
