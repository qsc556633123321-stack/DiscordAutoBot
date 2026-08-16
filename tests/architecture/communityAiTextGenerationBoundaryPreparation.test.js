const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const adapterPath = path.join(root, 'src/infrastructure/community/CommunityConciergeTextGenerationAdapter.js');
const adapter = fs.readFileSync(adapterPath, 'utf8');

assert.equal(fs.existsSync(adapterPath), true);
for (const required of ['async function generateConciergeText', "model: 'gpt-4o-mini'", 'JSON.stringify({ kind, context })', 'temperature: 0.85', 'max_tokens: 120', 'communityConciergeTextGenerationAdapter.generate({ request, fallback })']) {
  assert.equal(runtime.includes(required), true, `Runtime must retain ${required}`);
}
for (const forbidden of ["import('openai')", 'new OpenAI', 'chat.completions.create', 'response.choices?.']) {
  assert.equal(runtime.includes(forbidden), false, `Runtime must not own ${forbidden}`);
}
for (const required of ["loadOpenAi = () => import('openai')", 'new OpenAI({ apiKey })', 'openai.chat.completions.create(request)', 'response.choices?.[0]?.message?.content?.trim() || fallback']) {
  assert.equal(adapter.includes(required), true, `Adapter must retain ${required}`);
}
for (const forbidden of ['node:fs', 'discord.js', 'writeFile', 'saveOnboarding', 'persist', "require('../../application", "require('../../domain"]) {
  assert.equal(adapter.includes(forbidden), false, `Adapter must not own ${forbidden}`);
}
assert.match(runtime, /createCommunityChannelSetupCompatibilityAdapter/);
assert.match(runtime, /buildCommunityRoleConciergePresentationPayload/);
assert.match(runtime, /buildCommunityNonRoleConciergePresentationPayload/);
console.log('Community AI transport is Infrastructure-owned while prompt and request semantics remain Runtime-owned.');
