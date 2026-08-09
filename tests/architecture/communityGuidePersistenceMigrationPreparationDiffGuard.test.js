const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.match(guide, /saveOnboarding\(guild\.id, \{/);
assert.match(guide, /guideChannelId: channel\.id/);
assert.match(guide, /guideMessageId: message\.id/);
assert.match(guide, /nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS/);
assert.match(guide, /nativeTaskExcludedChannels:/);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/guidePublication/GuidePersistenceRequest.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/GuidePersistenceFilesystemAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuidePersistenceFeature.js')), true);
console.log('Guide persistence request and reuse Composition are implemented while runtime and duplicate writer surfaces remain unchanged.');
