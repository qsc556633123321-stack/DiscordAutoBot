const assert = require('node:assert/strict');
const {
  generateConciergeText
} = require('../../../src/systems/communityConcierge');
const {
  createLegacyConciergeTextGenerator
} = require('../../../src/adapters/legacy/legacyConciergeTextGenerator');
const {
  createCommunityConciergeTextGenerationAdapter
} = require('../../../src/infrastructure/community/CommunityConciergeTextGenerationAdapter');

void (async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const fallback = { marker: 'fallback' };
    assert.strictEqual(await generateConciergeText('guide', { guildName: 'KU' }, fallback), fallback);
    assert.strictEqual(await createLegacyConciergeTextGenerator().generate('guide', { guildName: 'KU' }, fallback), fallback);
  } finally {
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
  }

  let receivedRequest = null;
  const adapter = createCommunityConciergeTextGenerationAdapter({
    apiKeyProvider: () => 'key',
    loadOpenAi: async () => ({
      default: class OpenAI {
        constructor() {
          this.chat = { completions: { create: async (request) => {
            receivedRequest = request;
            return { choices: [{ message: { content: '  generated  ' } }] };
          } } };
        }
      }
    })
  });
  const request = { model: 'gpt-4o-mini', messages: [], temperature: 0.85, max_tokens: 120 };
  assert.equal(await adapter.generate({ request, fallback: 'fallback' }), 'generated');
  assert.strictEqual(receivedRequest, request);
  console.log('Production Concierge compatibility API and the Infrastructure transport preserve no-key fallback and request passthrough behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
