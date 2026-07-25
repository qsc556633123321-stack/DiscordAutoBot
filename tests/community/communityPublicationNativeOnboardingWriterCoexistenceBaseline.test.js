const assert = require('assert');
const fixture = require('../fixtures/communityLegacyPersistenceWriterCoexistenceBaseline');
const { createCommunityLegacyPersistenceWriterHarness } = require('../helpers/createCommunityLegacyPersistenceWriterHarness');

const sequential = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
sequential.applySnapshot('guide', sequential.snapshot('guide'), 'guildA', fixture.guideWriterPatch);
sequential.applySnapshot('native', sequential.snapshot('native'), 'guildA', fixture.nativeWriterPatch);
assert.equal(sequential.getRoot().guildA.guideMessageId, 'guide-next-message');
assert.deepEqual(sequential.getRoot().guildA.nativeTaskRecommendations, ['entry', 'roles']);

const overlap = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
const publication = overlap.snapshot('guide');
const native = overlap.snapshot('native');
overlap.applySnapshot('native', native, 'guildA', fixture.nativeWriterPatch);
overlap.applySnapshot('guide', publication, 'guildA', fixture.guideWriterPatch);
assert.deepEqual(overlap.getRoot().guildA.nativeTaskRecommendations, ['welcome']);
assert.equal(overlap.getRoot().guildA.guideMessageId, 'guide-next-message');
console.log('community publication/native onboarding writer coexistence baseline passed');
