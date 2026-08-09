const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createFakeProductionShapeGuidePersistenceFeature } = require('../../fakes/community/FakeProductionShapeGuidePersistenceFeature');
const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');

const result = { persisted: true, record: {} };
const candidate = createFakeProductionShapeGuidePersistenceFeature({
  communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute() { return result; } } }
});
const returned = candidate.persist(createGuidePersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' }));
assert.strictEqual(returned, result);
assert.equal(typeof returned?.then, 'undefined');

const source = fs.readFileSync(path.resolve(__dirname, '../../fakes/community/FakeProductionShapeGuidePersistenceFeature.js'), 'utf8');
assert.doesNotMatch(source, /\basync\b|\bawait\b|Promise/);
console.log('Guide reuse feature candidate remains synchronous and non-Promise based');
