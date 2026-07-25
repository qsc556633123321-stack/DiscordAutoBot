const assert = require('assert');
const fixture = require('../fixtures/communityLegacyPersistenceWriterCoexistenceBaseline');
const { createCommunityLegacyPersistenceWriterHarness } = require('../helpers/createCommunityLegacyPersistenceWriterHarness');

const harness = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
const guide = harness.snapshot('guide-runtime');
const bootstrap = harness.snapshot('bootstrap-indirect-guide');
harness.applySnapshot('guide-runtime', guide, 'guildA', fixture.guideWriterPatch, { sideEffectBeforeWrite: 'guide-send' });
harness.applySnapshot('bootstrap-indirect-guide', bootstrap, 'guildA', fixture.bootstrapWriterPatch);
assert.equal(harness.getRoot().guildA.guideMessageId, 'guide-message');
assert.deepEqual(harness.getRoot().guildA.defaultChannels, ['entry', 'guide']);
assert.equal(harness.sideEffects[0].value, 'guide-send');
console.log('community bootstrap/rebuild writer coexistence baseline passed');
