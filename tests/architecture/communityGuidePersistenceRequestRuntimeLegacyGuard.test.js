const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(guide, /saveOnboarding\(guild\.id, \{/);
assert.match(guide, /guideChannelId: channel\.id/);
assert.match(guide, /guideMessageId: message\.id/);
assert.match(guide, /nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS/);
assert.match(guide, /nativeTaskExcludedChannels:/);
assert.doesNotMatch(guide, /createGuidePersistenceRequest|mapGuidePersistenceRequestToGenericInput|createCommunityGuidePersistenceFeature/);
assert.doesNotMatch(roadmap, /GuidePersistenceRequest/);
console.log('Guide runtime remains legacy-owned and Roadmap runtime remains independent.');
