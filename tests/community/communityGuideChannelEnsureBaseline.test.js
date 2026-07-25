const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const concierge = require('../../src/systems/communityConcierge');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

async function main() {
  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryCreateFails: true } });
    await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'create' }), /category create failure/);
    assert.deepEqual(log.calls.filter((call) => !call.endsWith('.read')), ['category.create']);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: {} });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.deepEqual(log.calls.filter((call) => !call.endsWith('.read')), fixture.order.missingGuideChannel);
    assert.equal(log.created[1].options.parent, 'category-1');
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'wrong-parent', log, behavior: {}, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(log.calls.includes('guide.channel.setParent'), true);
    assert.equal(log.parentMove.options.lockPermissions, false);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'wrong-parent', log, behavior: { parentFails: true }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'create' }), /guide parent failure/);
    assert.equal(log.calls.includes('guide.overwrite.set'), false);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { overwriteFails: true }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(log.calls.includes('guide.message.send'), true, 'overwrite failure is swallowed before publication');
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { guideChannelCreateFails: true } });
    await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'create' }), /guide channel create failure/);
    assert.equal(log.calls.includes('category.create'), true);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });

  const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'systems', 'communityConcierge.js'), 'utf8');
  assert.equal(source.includes('.setPosition('), false, 'wrong-position branch is not implemented by production runtime');
  assert.equal(source.includes('permissionOverwrites.edit'), false, 'production runtime sets the full overwrite collection');
  assert.deepEqual(fixture.notApplicable.slice(0, 2), ['guide.channel.setPosition', 'permissionOverwrites.edit']);
  console.log('Community Guide channel ensure baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
