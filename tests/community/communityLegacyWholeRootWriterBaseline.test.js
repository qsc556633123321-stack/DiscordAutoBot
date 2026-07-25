const assert = require('assert');
const fixture = require('../fixtures/communityLegacyPersistenceWriterCoexistenceBaseline');
const { createCommunityLegacyPersistenceWriterHarness } = require('../helpers/createCommunityLegacyPersistenceWriterHarness');

const harness = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
const snapshot = harness.snapshot('guide-runtime');
harness.applySnapshot('guide-runtime', snapshot, 'guildA', fixture.guideWriterPatch);
assert.equal(harness.getRoot().guildA.guideMessageId, 'guide-next-message');
assert.equal(harness.getRoot().guildB.guideMessageId, 'guide-b');
assert.deepEqual(harness.getRoot().unknownRootField, { retained: true });

const stale = createCommunityLegacyPersistenceWriterHarness({ root: fixture.fullRoot });
const a = stale.snapshot('writer-a');
const b = stale.snapshot('writer-b');
stale.applySnapshot('writer-a', a, 'guildA', fixture.guideWriterPatch);
stale.applySnapshot('writer-b', b, 'guildB', { guideMessageId: 'guide-b-next' });
assert.equal(stale.getRoot().guildA.guideMessageId, 'guide-message', 'stale whole-root write loses A update');
assert.equal(stale.getRoot().guildB.guideMessageId, 'guide-b-next');
assert.throws(() => createCommunityLegacyPersistenceWriterHarness({ readError: new Error('read') }).read('x'), /read/);
assert.throws(() => createCommunityLegacyPersistenceWriterHarness({ writeError: new Error('write') }).applySnapshot('x', {}, 'guildA', {}), /write/);
console.log('community legacy whole-root writer baseline passed');
