const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /await message\.edit\(payload\)/);
assert.match(source, /message = await channel\.send\(payload\)/);
assert.doesNotMatch(source, /RoadmapPublicationMessageMutationPort|roadmapMutationPort/);
console.log('Roadmap mutation Port preparation static diff guard passed');
