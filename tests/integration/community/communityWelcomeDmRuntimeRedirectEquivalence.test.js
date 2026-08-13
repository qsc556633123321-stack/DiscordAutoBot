const assert = require('node:assert/strict');
const { deliverWelcomeDmCandidate } = require('../../fakes/community/FakeCommunityWelcomeDmRuntimeRedirect');
const fixtures = require('../../fixtures/community/community-welcome-dm-runtime-redirect-cases.json');

function createMember({ result, rejection, calls }) {
  return {
    send(payload) {
      calls.push(['send', payload]);
      return rejection === undefined ? Promise.resolve(result) : Promise.reject(rejection);
    }
  };
}

(async () => {
  assert.ok(fixtures.length >= 40);
  const guideChannel = { id: 'guide-1' };
  const payload = { content: 'Welcome' };
  const message = { id: 'dm-1' };
  const successCalls = [];
  const successMember = createMember({ result: message, calls: successCalls });
  const constructions = [];
  assert.equal(await deliverWelcomeDmCandidate({
    member: successMember,
    guideChannel,
    createPayload(channel) { successCalls.push(['payload', channel]); return payload; },
    createDmDelivery(args) { constructions.push(args); return require('../../../src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter').createCommunityWelcomeDmDeliveryAdapter(args); }
  }), undefined);
  assert.equal(constructions[0].member, successMember);
  assert.deepEqual(successCalls, [['payload', guideChannel], ['send', payload]]);

  for (const rejection of [new Error('dm'), 'dm', 7, {}, null]) {
    const calls = [];
    const member = createMember({ rejection, calls });
    assert.equal(await deliverWelcomeDmCandidate({ member, guideChannel, createPayload: () => payload }), undefined);
    assert.deepEqual(calls, [['send', payload]]);
  }
  const undefinedCalls = [];
  const undefinedMember = { send(value) { undefinedCalls.push(['send', value]); return Promise.reject(undefined); } };
  assert.equal(await deliverWelcomeDmCandidate({ member: undefinedMember, guideChannel, createPayload: () => payload }), undefined);
  assert.deepEqual(undefinedCalls, [['send', payload]]);

  let adapterCount = 0;
  let payloadCount = 0;
  assert.equal(await deliverWelcomeDmCandidate({
    member: successMember,
    guideChannel: null,
    createPayload() { payloadCount += 1; return payload; },
    createDmDelivery() { adapterCount += 1; throw new Error('must not construct'); }
  }), undefined);
  assert.equal(payloadCount, 0);
  assert.equal(adapterCount, 0);
  console.log('Welcome DM runtime redirect candidate preserves ordering, identity, no-channel isolation, result discard, and swallowed failures.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
