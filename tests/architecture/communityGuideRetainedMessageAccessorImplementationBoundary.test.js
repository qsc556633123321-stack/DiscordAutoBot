const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const session = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');

assert.match(session, /getRetainedMessage\(\)\s*\{\s*return retainedMessage;/s);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js'), 'utf8'), /getRetainedMessage/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8'), /getRetainedMessage/);
console.log('Guide retained-message accessor implementation boundary passed');
