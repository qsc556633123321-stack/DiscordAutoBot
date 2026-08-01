const assert = require('node:assert');
const event = require('../../src/events/guildMemberAdd');
const { createChannel, withWelcomeRuntimeHarness } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

(async () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', 'src/events/guildMemberAdd.js'), 'utf8');
  assert.match(source, /await sendConciergeWelcome\(member\)/);
  assert.match(source, /Community concierge welcome failed/);
  assert.equal(event.name, 'guildMemberAdd');
  await withWelcomeRuntimeHarness({ guildId: 'caller-guild', guildName: 'Caller Guild', root: { 'caller-guild': { guideChannelId: 'guide-1' } }, cachedChannels: [createChannel('guide-1')], sendSyncError: new Error('sync send') }, async ({ concierge, member }) => {
    let continuation = false;
    try { await concierge.sendConciergeWelcome(member); } catch { continuation = true; }
    assert.equal(continuation, true);
  });
  console.log('community welcome delivery caller behavior baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
