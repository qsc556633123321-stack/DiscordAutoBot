const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const adapterPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityConciergeTextGenerationAdapter.js');
const adapter = fs.readFileSync(adapterPath, 'utf8');

assert.equal(fs.existsSync(adapterPath), true);
for (const required of ["loadOpenAi = () => import('openai')", 'new OpenAI({ apiKey })', 'openai.chat.completions.create(request)', 'response.choices?.[0]?.message?.content?.trim() || fallback']) {
  assert.equal(adapter.includes(required), true, `adapter must own ${required}`);
}
for (const forbidden of ['discord.js', 'node:fs', 'writeFile', 'saveOnboarding', 'persist', "require('../../application", "require('../../domain"]) {
  assert.equal(adapter.includes(forbidden), false, `adapter must not own ${forbidden}`);
}
for (const forbidden of ["import('openai')", 'new OpenAI', 'chat.completions.create', 'response.choices?.']) {
  assert.equal(runtime.includes(forbidden), false, `runtime must not own ${forbidden}`);
}
for (const required of ['async function generateConciergeText(kind, context, fallback)', "model: 'gpt-4o-mini'", 'JSON.stringify({ kind, context })', 'temperature: 0.85', 'max_tokens: 120', 'communityConciergeTextGenerationAdapter.generate({ request, fallback })']) {
  assert.equal(runtime.includes(required), true, `runtime must retain ${required}`);
}
console.log('Community Concierge runtime owns prompt construction while Infrastructure owns the narrow OpenAI transport contract.');
