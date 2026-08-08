const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '..', '..', 'src', 'systems', 'communityConcierge.js'), 'utf8');
assert.match(source, /async function setupRoadmapPanel/);
assert.match(source, /roadmapMessageId/);
assert.match(source, /await message\.edit\(payload\)/);
assert.match(source, /else message = await channel\.send\(payload\)/);
console.log('community Roadmap non-regression after Guide mutation Plan branch integration passed');
