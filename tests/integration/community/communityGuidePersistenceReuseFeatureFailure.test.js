const assert = require('node:assert/strict');
const { createFakeProductionShapeGuidePersistenceFeature } = require('../../fakes/community/FakeProductionShapeGuidePersistenceFeature');
const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');

const request = createGuidePersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' });
const writeFailure = { persisted: false, record: { guideMessageId: 'M' } };
let calls = 0;
const failedWrite = createFakeProductionShapeGuidePersistenceFeature({
  communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute() { calls += 1; return writeFailure; } } }
});
assert.strictEqual(failedWrite.persist(request), writeFailure);
assert.equal(calls, 1);

for (const invariant of [new Error('guildId is required'), 'invalid', 42, { exact: true }, null, undefined]) {
  const throwing = createFakeProductionShapeGuidePersistenceFeature({
    communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute() { throw invariant; } } }
  });
  let received = Symbol('not-thrown');
  try { throwing.persist(request); } catch (error) { received = error; }
  assert.strictEqual(received, invariant);
}
console.log('Guide reuse feature candidate passes persisted false and all generic thrown values through exactly');
