const assert = require('node:assert/strict');
const { createCommunityWelcomeDmDeliveryAdapter } = require('../../../src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter');

function createMember({ result, rejection, calls }) {
  return {
    send(payload) {
      calls.push(['send', payload]);
      return rejection === undefined ? Promise.resolve(result) : Promise.reject(rejection);
    }
  };
}

(async () => {
  for (const member of [undefined, null, {}, { send: null }, { send: true }]) {
    assert.throws(() => createCommunityWelcomeDmDeliveryAdapter({ member }), {
      name: 'TypeError', message: 'CommunityWelcomeDmDeliveryAdapter requires member.send'
    });
  }

  const payload = Object.freeze({ content: 'Welcome' });
  const message = { id: 'message-1' };
  const calls = [];
  const member = createMember({ result: message, calls });
  const adapter = createCommunityWelcomeDmDeliveryAdapter({ member });
  assert.equal(Object.isFrozen(adapter), true);
  assert.deepEqual(Object.keys(adapter), ['send']);
  assert.equal(await adapter.send(payload), message);
  assert.deepEqual(calls, [['send', payload]]);

  for (const rejection of [new Error('dm'), 'dm', 7, {}, null]) {
    const failureCalls = [];
    const failureMember = createMember({ rejection, calls: failureCalls });
    assert.equal(await createCommunityWelcomeDmDeliveryAdapter({ member: failureMember }).send(payload), null);
    assert.deepEqual(failureCalls, [['send', payload]]);
  }

  const undefinedCalls = [];
  const undefinedMember = { send(payload) { undefinedCalls.push(['send', payload]); return Promise.reject(undefined); } };
  assert.equal(await createCommunityWelcomeDmDeliveryAdapter({ member: undefinedMember }).send(payload), null);
  assert.deepEqual(undefinedCalls, [['send', payload]]);
  console.log('Community Welcome DM delivery adapter preserves validation, identity, result, and swallowed failure contracts.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
