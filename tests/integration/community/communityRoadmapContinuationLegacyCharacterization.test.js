const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-roadmap-continuation-cases.json');
const {
  concierge,
  createGuild,
  createMessage,
  createRoadmapChannel,
  withOnboardingFile
} = require('../../helpers/createCommunityRoadmapContinuationHarness');

async function main() {
  assert.equal(fixture.schemaVersion, 1);

  await withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: 'tracked' } } }, async ({ log, getState }) => {
    const tracked = createMessage('tracked', log, {}, 'roadmap');
    const result = await concierge.setupRoadmapPanel(createGuild(log, createRoadmapChannel(log, { existingMessage: tracked })));
    assert.equal(result.message, tracked);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
    assert.equal(getState()['guild-1'].roadmapMessageId, 'tracked');
  });

  await withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: 'missing' } } }, async ({ log, getState }) => {
    const result = await concierge.setupRoadmapPanel(createGuild(log, createRoadmapChannel(log)));
    assert.equal(result.message.id, 'roadmap-channel-sent');
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    assert.equal(getState()['guild-1'].roadmapMessageId, 'roadmap-channel-sent');
  });

  await withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: 'missing' } } }, async ({ log }) => {
    await concierge.setupRoadmapPanel(createGuild(log, createRoadmapChannel(log, { fetchFails: true })));
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const result = await concierge.setupRoadmapPanel(createGuild(log, null, { categoryExists: false }));
    assert.equal(result.message.id, 'roadmap-channel-2-sent');
    assert.equal(log.calls.includes('category.create'), true);
    assert.equal(log.calls.includes('roadmap.channel.create'), true);
  });

  console.log('Community Roadmap continuation legacy characterization passed');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
