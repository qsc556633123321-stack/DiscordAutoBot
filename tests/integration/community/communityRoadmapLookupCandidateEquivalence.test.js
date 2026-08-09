const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapLookupBoundary } = require('../../fakes/community/FakeCommunityRoadmapLookupBoundary');

(async () => {
  const message = { id: 'M' };
  let fetches = 0;
  const candidate = createFakeCommunityRoadmapLookupBoundary({ channel: { messages: { async fetch() { fetches += 1; return message; } } } });
  const available = await candidate.lookup({ messageId: 'M' });
  assert.deepEqual(available, { kind: 'Available', messageId: 'M' });
  assert.equal(candidate.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  const missing = await candidate.lookup({ messageId: '' });
  assert.deepEqual(missing, { kind: 'Unavailable' });
  assert.equal(fetches, 1);
  console.log('Community Roadmap lookup candidate equivalence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
