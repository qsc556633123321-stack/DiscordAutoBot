const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js'), 'utf8');
assert.doesNotMatch(source, /saveOnboarding|persist|repository|node:fs|require\(['"]fs['"]\)/i);
console.log('Roadmap Resource Session mutation has no persistence coupling');
