const assert = require('node:assert/strict');
const { createGuidePublicationExecutionRequest } = require('../../src/application/community');

const request = createGuidePublicationExecutionRequest({
  operation: 'EditExistingMessage',
  payload: { content: 'Guide' },
  trackedMessageId: 'tracked-message'
});

for (const missingPortInput of ['guildId', 'channelId', 'messageId', 'channel', 'message', 'destination', 'resourceReference']) {
  assert.equal(missingPortInput in request, false, `${missingPortInput} must not be implied by the current request`);
}
assert.equal(request.operation, 'EditExistingMessage');
assert.equal(request.trackedMessageId, 'tracked-message');

console.log('Community Guide Discord mutation port input sufficiency tests passed.');
