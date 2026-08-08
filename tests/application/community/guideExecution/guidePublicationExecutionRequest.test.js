const assert = require('node:assert/strict');
const { createGuidePublicationExecutionRequest } = require('../../../../src/application/community/guideExecution/GuidePublicationExecutionRequest');

const payload = { embeds: [{ title: 'Guide' }] };
const trackedMessageId = { legacy: true };
const request = createGuidePublicationExecutionRequest({ operation: 'EditExistingMessage', payload, trackedMessageId, ignored: 'value' });
assert.equal(Object.isFrozen(request), true);
assert.deepEqual(request, { operation: 'EditExistingMessage', payload, trackedMessageId });
assert.throws(() => createGuidePublicationExecutionRequest(), /operation is required/);
assert.equal('channel' in request, false);
assert.equal('message' in request, false);
assert.equal('saveOnboarding' in request, false);
console.log('guide publication execution request passed');
