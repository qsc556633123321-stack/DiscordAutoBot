const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

const adapter = path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js');
assert.equal(fs.existsSync(adapter), true);
const source = fs.readFileSync(adapter, 'utf8');
assert.equal(/node:fs|discord\.js|require\(.+application|require\(.+composition|createGuidePublicationResourceSession/.test(source), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideMutationAdapterFeature.js')), false);
console.log('Guide production mutation adapter implementation diff guard passed');
