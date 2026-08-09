const assert = require('node:assert/strict');
const { withOnboardingFile, createGuild, createMessage, createTextChannel } = require('../../helpers/createCommunityGuideMutationHarness');

async function runCase({ trackedMessageId, fetchedMessage, sentMessage, initial }) {
  return withOnboardingFile({ initial }, async ({ log, getState }) => {
    const concierge = require('../../../src/systems/communityConcierge');
    const roadmap = createTextChannel({
      id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME,
      parentId: 'category-existing', log, label: 'roadmap'
    });
    roadmap.messages.fetch = async (messageId) => {
      log.calls.push('roadmap.message.fetch');
      assert.equal(messageId, trackedMessageId);
      return fetchedMessage;
    };
    roadmap.send = async () => {
      log.calls.push('roadmap.message.send');
      return sentMessage;
    };
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
      log, behavior: { categoryExists: true }, existingRoadmap: roadmap
    });
    return { result: await concierge.setupRoadmapPanel(guild), roadmap, log, state: getState() };
  });
}

(async () => {
  const edited = createMessage('M', { calls: [] }, {}, 'roadmap');
  let editCalls = 0;
  edited.edit = async () => { editCalls += 1; return edited; };
  const editCase = await runCase({
    trackedMessageId: 'M', fetchedMessage: edited, sentMessage: { id: 'unused' },
    initial: {
      'guild-1': { roadmapMessageId: 'M', guideChannelId: 'guide-channel', guideMessageId: 'guide-message', unknown: { preserved: true } },
      'other-guild': { roadmapChannelId: 'other-channel', roadmapMessageId: 'other-message' }
    }
  });
  assert.strictEqual(editCase.result.channel, editCase.roadmap);
  assert.strictEqual(editCase.result.message, edited);
  assert.equal(editCalls, 1);
  assert.equal(editCase.log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
  assert.equal(editCase.log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
  assert.equal(editCase.log.calls.filter((call) => call === 'onboarding.write').length, 1);
  assert.equal(editCase.state['guild-1'].roadmapChannelId, 'roadmap-channel');
  assert.equal(editCase.state['guild-1'].roadmapMessageId, 'M');
  assert.equal(editCase.state['guild-1'].guideChannelId, 'guide-channel');
  assert.deepEqual(editCase.state['guild-1'].unknown, { preserved: true });
  assert.deepEqual(editCase.state['other-guild'], { roadmapChannelId: 'other-channel', roadmapMessageId: 'other-message' });

  const sent = { id: 'S' };
  const sendCase = await runCase({
    trackedMessageId: 'missing', fetchedMessage: null, sentMessage: sent,
    initial: { 'guild-1': { roadmapMessageId: 'missing', guideMessageId: 'guide-message' } }
  });
  assert.strictEqual(sendCase.result.message, sent);
  assert.equal(sendCase.log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
  assert.equal(sendCase.log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
  assert.equal(sendCase.log.calls.filter((call) => call === 'onboarding.write').length, 1);
  assert.equal(sendCase.state['guild-1'].roadmapMessageId, 'S');
  assert.ok(sendCase.log.calls.indexOf('roadmap.message.send') < sendCase.log.calls.indexOf('onboarding.write'));
  console.log('Roadmap end-to-end closure happy paths preserve mutation, identity, and schema contracts.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
