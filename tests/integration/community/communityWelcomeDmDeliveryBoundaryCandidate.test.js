const assert = require('node:assert/strict');
const { createCommunityWelcomeDmDeliveryAdapter } = require('../../fakes/community/FakeCommunityWelcomeDmDeliveryAdapterV2');
const fixtures = require('../../fixtures/community/community-welcome-dm-delivery-cases.json');

function createMember({ result, rejects = false, rejection, calls }) {
  return {
    send(payload) {
      calls.push(['send', payload]);
      return rejects ? Promise.reject(rejection) : Promise.resolve(result);
    }
  };
}

(async () => {
  assert.ok(fixtures.length >= 40);
  const payload = Object.freeze({ content: 'Welcome' });
  const message = { id: 'dm-message' };
  const calls = [];
  const member = createMember({ result: message, calls });
  const adapter = createCommunityWelcomeDmDeliveryAdapter({ member });
  assert.equal(Object.isFrozen(adapter), true);
  assert.deepEqual(Object.keys(adapter), ['send']);
  assert.equal(await adapter.send(payload), message);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1], payload);

  for (const rejection of [new Error('dm'), 'dm', 7, {}, null, undefined]) {
    const failureCalls = [];
    const failureMember = createMember({ rejects: true, rejection, calls: failureCalls });
    assert.equal(await createCommunityWelcomeDmDeliveryAdapter({ member: failureMember }).send(payload), null);
    assert.deepEqual(failureCalls, [['send', payload]]);
  }
  assert.throws(() => createCommunityWelcomeDmDeliveryAdapter({}), {
    name: 'TypeError', message: 'CommunityWelcomeDmDeliveryAdapter requires member.send'
  });
  console.log('Welcome DM delivery candidate preserves recipient, payload, message result, swallowed failure, and one-send behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
