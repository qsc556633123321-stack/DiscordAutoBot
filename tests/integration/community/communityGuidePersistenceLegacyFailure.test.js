const assert = require('node:assert/strict');
const concierge = require('../../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function run({ trackedId, mode }) {
  return withOnboardingFile({ initial: { 'guild-1': trackedId ? { guideMessageId: trackedId } : {} }, writeFails: true }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: trackedId ? createMessage(trackedId, log) : null }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    return { result: await concierge.setupCommunityGuide(guild, { mode }), log, state: getState() };
  });
}

(async () => {
  const edit = await run({ trackedId: 'M', mode: 'refresh' });
  assert.equal(edit.result.message.id, 'M');
  assert.equal(edit.log.calls.filter((call) => call === 'guide.message.edit').length, 1);
  assert.equal(edit.log.writes, 1);
  assert.deepEqual(edit.state, { 'guild-1': { guideMessageId: 'M' } });

  const send = await run({ trackedId: null, mode: 'create' });
  assert.equal(send.result.message.id, 'guide-channel-sent');
  assert.equal(send.log.calls.filter((call) => call === 'guide.message.send').length, 1);
  assert.equal(send.log.writes, 1);
  assert.deepEqual(send.state, { 'guild-1': {} });
  console.log('Guide legacy writer failure remains writer-swallowed partial success for Edit and Send.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
