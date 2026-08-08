const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const session = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(runtime, /handoffRetainedMessage|getRetainedMessage|takeRetainedMessage/);
assert.doesNotMatch(session, /handoffRetainedMessage|getRetainedMessage|takeRetainedMessage/);
console.log('Community guide lookup message identity handoff preparation diff guard passed');
