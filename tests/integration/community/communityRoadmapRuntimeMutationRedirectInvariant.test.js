const assert = require('node:assert/strict');

const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');
const { redirectRoadmapMutation } = require('../../fakes/community/FakeCommunityRoadmapRuntimeMutationRedirect');

(async () => {
  const missingPair = createCommunityRoadmapAdapterPairFeature().createAdapterPair({
    ensuredChannel: {
      id: 'C',
      messages: { async fetch() { return null; } },
      async send() { return { id: 'S' }; }
    }
  });
  missingPair.getRetainedMessage = () => null;

  await assert.rejects(
    redirectRoadmapMutation({ pair: missingPair, message: null, payload: {}, write: async () => {} }),
    /retained-message invariant/
  );

  const mismatchPair = createCommunityRoadmapAdapterPairFeature().createAdapterPair({
    ensuredChannel: {
      id: 'C',
      messages: { async fetch() { return null; } },
      async send() { return { id: 'S' }; }
    }
  });
  mismatchPair.getRetainedMessage = () => ({ id: 'different' });

  await assert.rejects(
    redirectRoadmapMutation({ pair: mismatchPair, message: null, payload: {}, write: async () => {} }),
    /retained-message invariant/
  );

  console.log('Roadmap redirect candidate guards missing and mismatched retained Send identity');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
