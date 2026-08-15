const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-ai-text-generation-cases.json');
const {
  createFakeCommunityConciergeTextGenerationAdapter
} = require('../../fakes/community/FakeCommunityConciergeTextGenerationAdapter');

const request = Object.freeze({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'frozen concierge prompt' },
    { role: 'user', content: JSON.stringify({ kind: 'guide', context: { guildName: 'KU' } }) }
  ],
  temperature: 0.85,
  max_tokens: 120
});

async function runCase(item) {
  let constructors = 0;
  let calls = 0;
  const fallback = { name: 'fallback' };
  const loadOpenAi = async () => {
    if (item.loaderReject) throw item.loaderReject;
    return {
      default: class OpenAI {
        constructor(options) {
          constructors += 1;
          assert.strictEqual(options.apiKey, item.apiKey);
          this.chat = { completions: { create: async (received) => {
            calls += 1;
            assert.strictEqual(received, request);
            if (item.reject) throw item.reject;
            if (item.response) return item.response;
            return { choices: [{ message: { content: item.content } }] };
          } } };
        }
      }
    };
  };

  const result = await createFakeCommunityConciergeTextGenerationAdapter({
    apiKey: item.apiKey,
    loadOpenAi
  }).generate({ request, fallback });

  if (item.expected === 'fallback') assert.strictEqual(result, fallback);
  else assert.equal(result, item.expected);
  if (!item.apiKey) {
    assert.equal(constructors, 0);
    assert.equal(calls, 0);
  } else if (item.loaderReject) {
    assert.equal(constructors, 0);
    assert.equal(calls, 0);
  } else {
    assert.equal(constructors, 1);
    assert.equal(calls, 1);
  }
}

void (async () => {
  for (const item of cases) await runCase(item);
  console.log('AI text-generation candidate preserves key, request, response, fallback, and silent failure contracts.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
