const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(guide, /createGuidePersistenceRequest\(\{/);
assert.match(guide, /guildId: guild\.id/);
assert.match(guide, /channelId: channel\.id/);
assert.match(guide, /messageId: message\.id/);
assert.match(guide, /nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS/);
assert.match(guide, /nativeTaskExcludedChannels:/);
assert.match(guide, /createCommunityGuidePersistenceFeature/);
assert.match(guide, /communityGuidePersistenceFeature\.persist\(persistenceRequest\)/);
assert.doesNotMatch(guide, /saveOnboarding\(|mapGuidePersistenceRequestToGenericInput|persistCommunityPublicationRecord\.execute/);
assert.doesNotMatch(roadmap, /GuidePersistenceRequest/);
console.log('Guide runtime uses semantic persistence while Roadmap runtime remains independent.');
