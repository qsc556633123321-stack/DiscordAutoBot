const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.match(guide, /createGuidePersistenceRequest\(\{/);
assert.match(guide, /guildId: guild\.id/);
assert.match(guide, /channelId: channel\.id/);
assert.match(guide, /messageId: message\.id/);
assert.match(guide, /nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS/);
assert.match(guide, /nativeTaskExcludedChannels:/);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/guidePublication/GuidePersistenceRequest.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/GuidePersistenceFilesystemAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuidePersistenceFeature.js')), true);
assert.match(guide, /communityGuidePersistenceFeature\.persist\(persistenceRequest\)/);
assert.doesNotMatch(guide, /saveOnboarding\(|persistCommunityPublicationRecord\.execute/);
console.log('Guide persistence request and reuse Composition are runtime-active while duplicate writer surfaces remain absent.');
