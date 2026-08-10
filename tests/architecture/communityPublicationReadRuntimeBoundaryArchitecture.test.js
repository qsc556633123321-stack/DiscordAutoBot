const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /require\('\.\.\/application\/community'\)/);
assert.match(runtime, /CommunityPublicationTrackingReadPort/);
assert.match(runtime, /CommunityPublicationTrackingReadCompatibilityAdapter/);
assert.equal(/fromLegacyPublicationRecord\(guild\.id, data\)/.test(runtime), false);
assert.equal(/toLegacyPublicationPatch|applyPublicationPatch|CommunityPublicationStateStore/.test(runtime), false);
console.log('community publication read runtime boundary architecture passed');
