const assert = require('node:assert/strict');
const concierge = require('../../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

function createGuideGuild(log, tracked) {
  const guide = createTextChannel({
    id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing',
    log, behavior: { existingMessage: tracked }, label: 'guide'
  });
  return {
    guide,
    guild: createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
      log, behavior: { categoryExists: true }, existingGuide: guide
    })
  };
}

(async () => {
  await withOnboardingFile({
    initial: {
      'guild-1': { guideMessageId: 'M', roadmapMessageId: 'R', welcome: { keep: true }, unknown: 'keep' },
      'other-guild': { guideMessageId: 'other-guide', unknown: true }
    }
  }, async ({ log, getState }) => {
    const message = createMessage('M', log);
    const { guide, guild } = createGuideGuild(log, message);
    const result = await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    const record = getState()['guild-1'];
    assert.strictEqual(result.channel, guide);
    assert.strictEqual(result.message, message);
    assert.equal(record.guideChannelId, guide.id);
    assert.equal(record.guideMessageId, message.id);
    assert.equal(record.roadmapMessageId, 'R');
    assert.deepEqual(record.welcome, { keep: true });
    assert.equal(record.unknown, 'keep');
    assert.deepEqual(getState()['other-guild'], { guideMessageId: 'other-guide', unknown: true });
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
    assert.ok(log.calls.indexOf('guide.message.edit') < log.calls.indexOf('onboarding.write'));
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log, getState }) => {
    const { guide, guild } = createGuideGuild(log, null);
    const result = await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(result.message.id, 'guide-channel-sent');
    assert.equal(getState()['guild-1'].guideChannelId, guide.id);
    assert.equal(getState()['guild-1'].guideMessageId, result.message.id);
    assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, 0);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
    assert.ok(log.calls.indexOf('guide.message.send') < log.calls.indexOf('onboarding.write'));
  });
  console.log('Guide legacy publication persistence preserves exact IDs, merge semantics, and ordering.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
