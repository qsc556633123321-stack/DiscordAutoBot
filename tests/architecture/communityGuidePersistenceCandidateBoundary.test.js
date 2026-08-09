const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const candidate = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeGuidePersistenceRequestCandidate.js'), 'utf8');
assert.doesNotMatch(candidate, /require\(|discord\.js|node:fs|readFile|writeFile|Repository|Client\.|\.messages\.|\.send\(|\.edit\(/);
assert.match(candidate, /guideChannelId/);
assert.match(candidate, /guideMessageId/);
assert.match(candidate, /nativeTaskRecommendations/);
assert.match(candidate, /nativeTaskExcludedChannels/);
console.log('Guide persistence request candidate is test-only, pure, and free of Discord/filesystem coupling.');
