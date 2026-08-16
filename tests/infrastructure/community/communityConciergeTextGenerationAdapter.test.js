const assert = require('node:assert/strict');
const {
  createCommunityConciergeTextGenerationAdapter
} = require('../../../src/infrastructure/community/CommunityConciergeTextGenerationAdapter');

const request = Object.freeze({ model: 'gpt-4o-mini' });

function createHarness({ apiKey, loadFailure, constructorFailure, requestFailure, response } = {}) {
  const calls = { load: 0, construct: 0, request: 0, receivedRequest: null, apiKey: null };
  const loadOpenAi = async () => {
    calls.load += 1;
    if (loadFailure !== undefined) throw loadFailure;
    return {
      default: class OpenAI {
        constructor(options) {
          calls.construct += 1;
          calls.apiKey = options.apiKey;
          if (constructorFailure !== undefined) throw constructorFailure;
          this.chat = { completions: { create: async (receivedRequest) => {
            calls.request += 1;
            calls.receivedRequest = receivedRequest;
            if (requestFailure !== undefined) throw requestFailure;
            return response;
          } } };
        }
      }
    };
  };
  return {
    calls,
    adapter: createCommunityConciergeTextGenerationAdapter({ apiKeyProvider: () => apiKey, loadOpenAi })
  };
}

void (async () => {
  const fallback = { marker: true };

  for (const apiKey of [undefined, null, '']) {
    const { adapter, calls } = createHarness({ apiKey });
    assert.strictEqual(await adapter.generate({ request, fallback }), fallback);
    assert.deepEqual(calls, { load: 0, construct: 0, request: 0, receivedRequest: null, apiKey: null });
  }

  const success = createHarness({
    apiKey: '   ',
    response: { choices: [{ message: { content: '  測試內容  ' } }] }
  });
  assert.equal(await success.adapter.generate({ request, fallback }), '測試內容');
  assert.equal(success.calls.load, 1);
  assert.equal(success.calls.construct, 1);
  assert.equal(success.calls.request, 1);
  assert.strictEqual(success.calls.receivedRequest, request);
  assert.equal(success.calls.apiKey, '   ');

  for (const response of [
    { choices: [{ message: { content: '' } }] },
    { choices: [{ message: { content: '   ' } }] },
    {},
    { choices: [] },
    { choices: [{}] },
    { choices: [{ message: { content: null } }] }
  ]) {
    const { adapter } = createHarness({ apiKey: 'key', response });
    assert.strictEqual(await adapter.generate({ request, fallback }), fallback);
  }

  const throwingResponse = {};
  Object.defineProperty(throwingResponse, 'choices', { get() { throw new Error('parser failure'); } });
  for (const options of [
    { apiKey: 'key', loadFailure: new Error('load failure') },
    { apiKey: 'key', constructorFailure: new Error('constructor failure') },
    { apiKey: 'key', requestFailure: new Error('request failure') },
    { apiKey: 'key', response: throwingResponse }
  ]) {
    const { adapter } = createHarness(options);
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;
    let logs = 0;
    console.warn = console.error = console.log = () => { logs += 1; };
    try {
      assert.strictEqual(await adapter.generate({ request, fallback }), fallback);
      assert.equal(logs, 0);
    } finally {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    }
  }

  const perInvocation = createHarness({
    apiKey: 'key',
    response: { choices: [{ message: { content: 'one' } }] }
  });
  await perInvocation.adapter.generate({ request, fallback });
  await perInvocation.adapter.generate({ request, fallback });
  assert.equal(perInvocation.calls.load, 2);
  assert.equal(perInvocation.calls.construct, 2);
  assert.equal(perInvocation.calls.request, 2);

  console.log('Community Concierge text adapter preserves lazy SDK, request identity, fallback identity, normalization, and silent failures.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
