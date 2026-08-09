const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort.js'), 'utf8');
assert.doesNotMatch(source, /require\(|discord\.js|infrastructure|composition|persistence|node:fs/);
for (const field of ['message', 'channel', 'guild', 'client', 'session', 'rawError', 'rawFailure', 'cause']) {
  assert.doesNotMatch(source, new RegExp(`\\b${field}\\b`, 'i'));
}
console.log('Roadmap mutation Port Application purity passed');
