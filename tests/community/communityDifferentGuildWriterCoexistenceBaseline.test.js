const assert = require('assert');
const fixture = require('../fixtures/communityLegacyPersistenceWriterCoexistenceBaseline');
const { createCommunityLegacyPersistenceWriterHarness } = require('../helpers/createCommunityLegacyPersistenceWriterHarness');

const sequential = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
sequential.applySnapshot('A', sequential.snapshot('A'), 'guildA', fixture.guideWriterPatch);
sequential.applySnapshot('B', sequential.snapshot('B'), 'guildB', fixture.roadmapWriterPatch);
assert.equal(sequential.getRoot().guildA.guideMessageId, 'guide-next-message');
assert.equal(sequential.getRoot().guildB.roadmapMessageId, 'roadmap-next-message');

const overlap = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
const a = overlap.snapshot('A');
const b = overlap.snapshot('B');
overlap.applySnapshot('A', a, 'guildA', fixture.guideWriterPatch);
overlap.applySnapshot('B', b, 'guildB', fixture.roadmapWriterPatch);
assert.equal(overlap.getRoot().guildA.guideMessageId, 'guide-message');
assert.equal(overlap.getRoot().guildB.roadmapMessageId, 'roadmap-next-message');
assert.equal(overlap.getRoot().guildC.roadmapMessageId, 'roadmap-c');
console.log('community different-guild writer coexistence baseline passed');
