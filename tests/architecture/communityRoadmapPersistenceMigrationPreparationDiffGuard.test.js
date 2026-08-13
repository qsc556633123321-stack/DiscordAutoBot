const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(source, /function saveOnboarding\(guildId, patch\)/);
assert.doesNotMatch(source, /RoadmapPublicationPersistencePort|RoadmapPublicationStateRepository/);
console.log('Roadmap persistence migration preparation leaves production persistence unchanged');
