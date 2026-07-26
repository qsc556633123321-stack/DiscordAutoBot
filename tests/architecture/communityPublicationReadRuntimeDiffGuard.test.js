const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(runtime, /function saveOnboarding\(guildId, patch\)/);
assert.match(runtime, /writeJson\(ONBOARDING_FILE, data\)/);
assert.match(runtime, /async function setupRoadmapPanel/);
assert.equal(/applyPublicationPatch|toLegacyPublicationPatch|CommunityPublicationStateStore/.test(runtime), false);
for (const forbidden of ['src/infrastructure/community/communityPublicationStateFilesystemAdapter.js', 'src/composition/communityPublicationStateFeature.js']) {
  assert.equal(fs.existsSync(path.join(root, forbidden)), false);
}
console.log('community publication read runtime diff guard passed');
