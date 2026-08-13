const assert = require('node:assert/strict');
const { createCommunityWelcomeDmDeliveryAdapter } = require('../../../src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter');

function createMember({ result, rejection, calls }) {
  return {
    send(payload) {
      calls.push(payload);
      return rejection === undefined ? Promise.resolve(result) : Promise.reject(rejection);
    }
  };
}

(async () => {
  const payload = { content: 'Welcome' };
  for (const scenario of [
    { result: { id: 'message-1' } },
    { rejection: new Error('dm') },
    { rejection: 'dm' },
    { rejection: 7 },
    { rejection: {} },
    { rejection: null },
    { rejection: undefined, rejectUndefined: true }
  ]) {
    const legacyCalls = [];
    const adapterCalls = [];
    const legacyMember = scenario.rejectUndefined
      ? { send(value) { legacyCalls.push(value); return Promise.reject(undefined); } }
      : createMember({ ...scenario, calls: legacyCalls });
    const adapterMember = scenario.rejectUndefined
      ? { send(value) { adapterCalls.push(value); return Promise.reject(undefined); } }
      : createMember({ ...scenario, calls: adapterCalls });
    const legacyResult = await legacyMember.send(payload).catch(() => null);
    const adapterResult = await createCommunityWelcomeDmDeliveryAdapter({ member: adapterMember }).send(payload);
    assert.equal(adapterResult, legacyResult);
    assert.deepEqual(adapterCalls, legacyCalls);
    assert.equal(adapterCalls[0], payload);
  }
  console.log('Community Welcome DM delivery adapter is observably equivalent to the legacy send expression.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
