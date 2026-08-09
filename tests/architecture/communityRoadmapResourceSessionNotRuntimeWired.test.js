const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(source, /createRoadmapPublicationResourceSession/);
console.log('Roadmap session is not runtime wired');
