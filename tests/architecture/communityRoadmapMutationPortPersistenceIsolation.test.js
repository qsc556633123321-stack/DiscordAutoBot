const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort.js'), 'utf8');
assert.doesNotMatch(source, /saveOnboarding|repository|writeFile|readFile|filesystem|persist/i);
console.log('Roadmap mutation Port remains persistence-isolated');
