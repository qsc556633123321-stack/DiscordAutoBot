const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /require\('\.\.\/application\/community'\)/);
assert.match(runtime, /fromLegacyPublicationRecord\(guild\.id, data\)/);
assert.equal(/toLegacyPublicationPatch|applyPublicationPatch|CommunityPublicationStateStore/.test(runtime), false);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationStateFeature.js')), false);
console.log('community publication read runtime boundary architecture passed');
