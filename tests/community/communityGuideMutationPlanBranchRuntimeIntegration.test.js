const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

async function run({ mode, trackedMessageId, fetch = 'not-attempted' }) {
  return withOnboardingFile({ initial: { 'guild-1': { guideMessageId: trackedMessageId } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: fetch === 'message' ? createMessage('tracked', log) : null, fetchFails: fetch === 'reject' }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild, mode === 'normal' ? {} : { mode });
    return { log, result };
  });
}

(async () => {
  for (const scenario of [
    { mode: 'normal', trackedMessageId: 'tracked', fetch: 'message', call: 'guide.message.edit' },
    { mode: 'refresh', trackedMessageId: 'tracked', fetch: 'message', call: 'guide.message.edit' },
    { mode: 'force', trackedMessageId: 'tracked', fetch: 'message', call: 'guide.message.send' },
    { mode: 'normal', trackedMessageId: null, call: 'guide.message.send' },
    { mode: 'normal', trackedMessageId: 'tracked', fetch: 'reject', call: 'guide.message.send' },
    { mode: 'normal', trackedMessageId: 7, fetch: 'message', call: 'guide.message.edit' },
    { mode: 'normal', trackedMessageId: { legacy: true }, fetch: 'message', call: 'guide.message.edit' },
    { mode: 'normal', trackedMessageId: ['legacy'], fetch: 'message', call: 'guide.message.edit' }
  ]) {
    const { log, result } = await run(scenario);
    assert.equal(log.calls.includes(scenario.call), true, JSON.stringify(scenario));
    assert.equal(result.message.id, scenario.call.endsWith('edit') ? 'tracked' : 'guide-channel-sent');
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
  }
  console.log('community Guide mutation Plan branch runtime integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
