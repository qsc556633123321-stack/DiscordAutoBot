const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const session = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');

assert.match(session, /getRetainedMessage\(\)/);
assert.match(session, /catch \(error\) \{\s*retainedMessage = null;\s*throw error;/s);
assert.doesNotMatch(runtime, /getRetainedMessage/);
assert.doesNotMatch(session, /takeRetainedMessage|AsyncLocalStorage|global\.|cache/);
console.log('Guide retained-message accessor implementation diff guard passed');
