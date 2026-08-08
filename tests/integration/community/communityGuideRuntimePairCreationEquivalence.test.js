const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-guide-runtime-pair-creation-cases.json');
const { createFakeCommunityGuideRuntimePairCreation } = require('../../fakes/community/FakeCommunityGuideRuntimePairCreation');

function createCandidate(log) {
  return createFakeCommunityGuideRuntimePairCreation({
    async ensureChannel() { log.push('ensure'); return { id: 'guide' }; },
    createAdapterPair({ ensuredChannel }) { log.push(`pair:${ensuredChannel.id}`); return {}; },
    async legacyLookup() { log.push('lookup'); return { id: 'tracked' }; },
    buildPlan({ existingMessageAvailable }) { log.push('plan'); return existingMessageAvailable ? 'edit' : 'send'; },
    async legacyEdit(message) { log.push('edit'); return message; },
    async legacySend() { log.push('send'); return { id: 'sent' }; },
    async persist() { log.push('persist'); },
    async roadmap() { log.push('roadmap'); }
  });
}

(async () => {
  assert.equal(cases.length, 60);
  for (const scenario of [
    { mode: 'normal', guideMessageId: 'tracked', expected: ['ensure', 'pair:guide', 'lookup', 'plan', 'edit', 'persist', 'roadmap'] },
    { mode: 'force', guideMessageId: 'tracked', expected: ['ensure', 'pair:guide', 'plan', 'send', 'persist', 'roadmap'] },
    { mode: 'normal', guideMessageId: null, expected: ['ensure', 'pair:guide', 'plan', 'send', 'persist', 'roadmap'] }
  ]) {
    const log = [];
    const result = await createCandidate(log)({ ...scenario, payload: {} });
    assert.deepEqual(log, scenario.expected);
    assert.equal(result.channel.id, 'guide');
  }
  console.log('Community guide runtime pair creation equivalence characterized');
})().catch((error) => { console.error(error); process.exitCode = 1; });
