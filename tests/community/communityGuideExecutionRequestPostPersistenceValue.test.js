const assert = require('node:assert/strict');
const cases = require('../fixtures/community/community-guide-execution-post-persistence-cases.json');
const { createGuidePublicationExecutionRequest } = require('../../src/application/community');

for (const item of cases) {
  const payload = { content: item.id, nested: { retained: true } };
  const request = createGuidePublicationExecutionRequest({
    operation: item.operation,
    payload,
    trackedMessageId: item.trackedMessageId
  });
  assert.equal(request.payload, payload, `${item.id}: payload remains the existing reference`);
  assert.equal(request.trackedMessageId, item.trackedMessageId, `${item.id}: tracked id is copied without normalization`);
  assert.equal(Object.isFrozen(request), true, `${item.id}: only the request shell is frozen`);
}

assert.throws(() => createGuidePublicationExecutionRequest({ payload: {} }), /operation is required/);
const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'src', 'application', 'community', 'guideExecution', 'GuidePublicationExecutionRequest.js'), 'utf8');
assert.equal(/normalize|clone|JSON\.parse|JSON\.stringify|\.send\(|\.edit\(|saveOnboarding/.test(source), false);

console.log('Community Guide execution request post-persistence value tests passed.');
