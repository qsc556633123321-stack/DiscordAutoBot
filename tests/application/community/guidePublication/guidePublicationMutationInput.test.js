const assert = require('node:assert');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');

const raw = { guildId: 'g', mode: 'force', trackedMessageId: { legacy: true }, existingMessageAvailable: true, existingMessageLookupAttempted: true };
const input = createGuidePublicationMutationInput(raw);
assert.deepEqual(input, raw);
assert.equal(Object.isFrozen(input), true);
assert.equal(input.trackedMessageId, raw.trackedMessageId);
assert.equal(createGuidePublicationMutationInput({}).trackedMessageId, undefined);
assert.equal(createGuidePublicationMutationInput({ existingMessageAvailable: 'true' }).existingMessageAvailable, false);
console.log('guide publication mutation input passed');
