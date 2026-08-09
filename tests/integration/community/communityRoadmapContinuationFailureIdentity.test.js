const assert = require('node:assert/strict');
const { concierge, createGuild, createRoadmapChannel, withOnboardingFile } = require('../../helpers/createCommunityRoadmapContinuationHarness');

async function capture(run) {
  let threw = false;
  let error = 'not-run';
  try { await run(); } catch (value) { threw = true; error = value; }
  return { threw, error };
}

async function main() {
  for (const [branch, raw] of [['edit', new Error('edit error')], ['edit', 'edit string'], ['edit', 12], ['edit', { edit: true }], ['edit', null], ['edit', undefined], ['send', new Error('send error')], ['send', 'send string'], ['send', 7], ['send', { send: true }], ['send', null], ['send', undefined]]) {
    await withOnboardingFile({ initial: { 'guild-1': branch === 'edit' ? { roadmapMessageId: 'tracked' } : {} } }, async ({ log }) => {
      const roadmap = createRoadmapChannel(log);
      if (branch === 'edit') {
        roadmap.messages.fetch = async () => ({ async edit() { throw raw; } });
      } else {
        roadmap.send = async () => { throw raw; };
      }
      const result = await capture(() => concierge.setupRoadmapPanel(createGuild(log, roadmap)));
      assert.equal(result.threw, true);
      assert.equal(result.error, raw);
      assert.equal(log.writes, 0);
    });
  }
  console.log('Community Roadmap continuation failure identity passed');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
