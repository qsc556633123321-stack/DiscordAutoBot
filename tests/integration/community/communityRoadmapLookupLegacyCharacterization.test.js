const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-roadmap-lookup-boundary-cases.json');
const { concierge, createGuild, createMessage, createRoadmapChannel, withOnboardingFile } = require('../../helpers/createCommunityRoadmapContinuationHarness');

async function run(messageId, existingMessage) {
  return withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: messageId } } }, async ({ log }) => {
    const roadmap = createRoadmapChannel(log, { existingMessage });
    const result = await concierge.setupRoadmapPanel(createGuild(log, roadmap));
    return { result, log, roadmap };
  });
}

(async () => {
  assert.equal(fixture.schemaVersion, 1);
  for (const value of [undefined, null, '', 0, false]) {
    const { log } = await run(value, null);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 0);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
  }
  const log = { calls: [] };
  const message = createMessage('tracked', log, {}, 'roadmap');
  const available = await run('tracked', message);
  assert.equal(available.result.message, message);
  assert.equal(available.log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
  console.log('Community Roadmap legacy lookup characterization passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
