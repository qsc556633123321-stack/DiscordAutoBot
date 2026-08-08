const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createGuidePublicationAdapterPair } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');
const { createFakeGuidePublicationAdapterPair } = require('../../../fakes/community/FakeGuidePublicationAdapterPairFactory');

(async () => {
  const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../fixtures/community/community-guide-adapter-pair-cases.json'), 'utf8'));
  assert.equal(cases.length, 60);
  const channel = { id: 'guide', messages: { async fetch() { return { id: 'tracked', async edit() {} }; } }, async send() { return { id: 'sent' }; } };
  const production = createGuidePublicationAdapterPair({ ensuredChannel: channel });
  const candidate = createFakeGuidePublicationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(await production.lookupPort.lookup({ messageId: 'tracked' }), await candidate.lookupPort.lookup({ messageId: 'tracked' }));
  assert.deepEqual(await production.mutationPort.send({ payload: {} }), await candidate.mutationPort.send({ payload: {} }));
  console.log('Guide production adapter pair factory compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
