const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

(async () => {
  const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../fixtures/community/community-guide-mutation-adapter-session-cases.json'), 'utf8'));
  assert.equal(cases.length, 50);
  const session = { async editTrackedMessage() {}, async sendMessage() { return { id: 'sent' }; } };
  const production = createGuidePublicationMessageMutationDiscordAdapter({ session });
  const candidate = createFakeGuidePublicationMessageMutationSessionAdapter({ session });
  const edit = { guildId: 'g', channelId: 'c', messageId: 'tracked', payload: {} };
  const send = { guildId: 'g', channelId: 'c', payload: {} };
  assert.deepEqual(await production.edit(edit), await candidate.edit(edit));
  assert.deepEqual(await production.send(send), await candidate.send(send));
  console.log('Guide production mutation adapter fixture compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
