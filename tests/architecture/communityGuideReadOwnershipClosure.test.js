const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '..', '..', 'src', 'systems', 'communityConcierge.js'), 'utf8');
const start = source.indexOf('async function setupCommunityGuide');
const end = source.indexOf('async function setupRoadmapPanel');
const guideRuntime = source.slice(start, end);

assert.equal((guideRuntime.match(/readOnboardingData\(\)/g) || []).length, 0);
assert.equal(guideRuntime.includes('createCommunityPublicationTrackingReadRequest'), true);
assert.equal(guideRuntime.includes('createCommunityPublicationTrackingReadCompatibilityAdapter'), true);
assert.equal(guideRuntime.includes('data.guideMessageId'), false);
assert.equal(guideRuntime.includes('fromLegacyPublicationRecord'), false);
assert.equal(guideRuntime.includes('fs.readFileSync'), false);
assert.equal(guideRuntime.includes('readJson('), false);
assert.equal(guideRuntime.includes('guideChannelId'), false, 'Guide channel identity is ensured, not read from legacy state');

console.log('Guide read ownership uses the shared tracking boundary for the tracked Guide message ID only.');
