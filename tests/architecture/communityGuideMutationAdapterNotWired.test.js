const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js')), true);
assert.equal(runtime.includes('GuidePublicationMessageMutationDiscordAdapter'), false);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideMutationAdapterFeature.js')), false);
console.log('Guide production mutation adapter not wired guard passed');
