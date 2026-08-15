const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
for (const forbidden of ["require('node:fs')", "require('node:path')", 'ensureFile(', 'readJson(', 'DATA_DIR', 'ONBOARDING_FILE']) {
  assert.equal(runtime.includes(forbidden), false, `runtime filesystem ownership must exclude ${forbidden}`);
}
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 0);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{/g) || []).length, 0);
console.log('Community filesystem ownership is closed: runtime owns no onboarding filesystem paths or direct JsonReader construction.');
