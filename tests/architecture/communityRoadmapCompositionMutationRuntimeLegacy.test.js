const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
assert.doesNotMatch(runtime, /roadmapMutationPort|RoadmapPublicationMessageMutationAdapter/);
console.log('Roadmap runtime mutation remains legacy-owned after Composition audit');
