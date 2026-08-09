const assert = require('node:assert/strict');
const { createFakeRoadmapPublicationPersistencePort } = require('../../fakes/community/FakeRoadmapPublicationPersistencePort');

const failure = new Error('writer failed');
const port = createFakeRoadmapPublicationPersistencePort({ save() { return { persisted: false, error: failure }; } });
const result = port.savePublicationState({ guildId: 'guild-1', channelId: 'C', messageId: 'M' });
assert.equal(port.calls.length, 1);
assert.equal(result.persisted, false);
assert.strictEqual(result.error, failure);
console.log('Roadmap test-only persistence Port candidate exposes one writer failure result');
