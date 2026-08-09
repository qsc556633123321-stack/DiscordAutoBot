const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js'), 'utf8');
assert.doesNotMatch(source, /GuidePublicationMessageLookupDiscordAdapter|GuidePublicationMessageLookupPort|GuidePublicationResourceSession/);
console.log('Roadmap production lookup adapter remains Guide-isolated');
