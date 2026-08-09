const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /saveOnboarding\(guild\.id, \{\s*guideChannelId: channel\.id,/);
assert.match(source, /saveOnboarding\(guild\.id, \{\s*roadmapChannelId: channel\.id,/);
assert.match(source, /guideMessageId: message\.id/);
assert.match(source, /roadmapMessageId: message\.id/);
console.log('Guide and Roadmap share the current onboarding shallow-merge writer contract');
