const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideLookupAdapterFeature.js')), false);
assert.equal(runtime.includes('GuidePublicationMessageLookupDiscordAdapter'), false);
console.log('Guide production lookup adapter implementation boundary passed');
