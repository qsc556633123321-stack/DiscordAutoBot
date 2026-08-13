const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(source, /saveOnboarding\(guild\.id, \{\s*guideChannelId: channel\.id,/);
assert.match(source, /guideMessageId: message\.id/);
assert.match(source, /createRoadmapPublicationPersistenceRequest/);
assert.match(source, /messageId: message\.id/);
console.log('Guide remains legacy-owned while Roadmap uses the semantic persistence redirect');
