const assert = require('assert');
const fixture = require('../fixtures/communityLegacyPersistenceWriterCoexistenceBaseline');
const { createCommunityLegacyPersistenceWriterHarness } = require('../helpers/createCommunityLegacyPersistenceWriterHarness');

const sequential = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
sequential.applySnapshot('guide', sequential.snapshot('guide'), 'guildA', fixture.guideWriterPatch);
sequential.applySnapshot('roadmap', sequential.snapshot('roadmap'), 'guildA', fixture.roadmapWriterPatch);
assert.equal(sequential.getRoot().guildA.guideMessageId, 'guide-next-message');
assert.equal(sequential.getRoot().guildA.roadmapMessageId, 'roadmap-next-message');

const overlap = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
const guideSnapshot = overlap.snapshot('guide');
const roadmapSnapshot = overlap.snapshot('roadmap');
overlap.applySnapshot('guide', guideSnapshot, 'guildA', fixture.guideWriterPatch, { sideEffectBeforeWrite: 'guide-send' });
overlap.applySnapshot('roadmap', roadmapSnapshot, 'guildA', fixture.roadmapWriterPatch, { sideEffectBeforeWrite: 'roadmap-send' });
assert.equal(overlap.getRoot().guildA.guideMessageId, 'guide-message');
assert.equal(overlap.getRoot().guildA.roadmapMessageId, 'roadmap-next-message');
assert.equal(overlap.sideEffects.length, 2);
console.log('community Guide/Roadmap writer coexistence baseline passed');
