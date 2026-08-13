const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.doesNotMatch(runtime, /function saveOnboarding\(guildId, patch\)/);
assert.match(runtime, /createCommunityPublicationStateFeature/);
assert.match(runtime, /persistCommunityPublicationRecord\.execute/);
assert.match(runtime, /async function setupRoadmapPanel/);
assert.equal(/applyPublicationPatch|toLegacyPublicationPatch|CommunityPublicationStateStore/.test(runtime), false);
console.log('community publication read runtime diff guard passed');
