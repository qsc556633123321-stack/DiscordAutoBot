const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests/fakes/community/FakeCommunityConciergeTextGenerationAdapter.js'), 'utf8');
const sourceDiff = [
  ...execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean),
  ...execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
];

assert.deepEqual([...new Set(sourceDiff)].sort(), []);
for (const required of ['async function generateConciergeText', 'process.env.OPENAI_API_KEY', "await import('openai')", 'new OpenAI({ apiKey: process.env.OPENAI_API_KEY })', 'openai.chat.completions.create', 'response.choices?.[0]?.message?.content?.trim() || fallback']) {
  assert.equal(runtime.includes(required), true, `Runtime must retain ${required}`);
}
assert.equal((runtime.match(/generateConciergeText/g) || []).length >= 3, true);
for (const forbidden of ['src/', 'node:fs', 'discord.js', 'process.env', 'console.', 'setTimeout']) {
  assert.equal(candidate.includes(forbidden), false, `Candidate must not own ${forbidden}`);
}
assert.match(candidate, /async generate\(\{ request, fallback \}/);
assert.match(runtime, /createCommunityChannelSetupCompatibilityAdapter/);
assert.match(runtime, /buildCommunityRoleConciergePresentationPayload/);
assert.match(runtime, /buildCommunityNonRoleConciergePresentationPayload/);
console.log('Community AI text generation remains Runtime-owned while the narrow transport candidate is frozen test-only.');
