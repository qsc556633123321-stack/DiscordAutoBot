const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8');

assert.equal(/module\.exports = \{ createGuidePublicationAdapterPair \}/.test(source), true);
assert.equal(/currentPair|currentSession|cache|registry|AsyncLocalStorage|singleton/.test(source), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js')), true);
console.log('Guide production adapter pair factory implementation diff guard passed');
