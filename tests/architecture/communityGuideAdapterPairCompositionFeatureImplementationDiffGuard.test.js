const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js'), 'utf8');

assert.match(source, /function createCommunityGuideAdapterPairFeature\(\{ createAdapterPair = createGuidePublicationAdapterPair \} = \{\}\)/);
assert.match(source, /module\.exports = \{ createCommunityGuideAdapterPairFeature \}/);
assert.equal(/EditRejected|SendRejected|MissingResource|Unknown|saveOnboarding|PersistCommunityPublication|Roadmap|node:fs|require\(['"]fs['"]\)/.test(source), false);
console.log('Community guide adapter pair composition feature implementation diff guard passed');
