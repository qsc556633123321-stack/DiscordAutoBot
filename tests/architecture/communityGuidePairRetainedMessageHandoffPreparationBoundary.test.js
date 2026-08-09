const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const session = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');
const pairFactory = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8');
const application = fs.readFileSync(path.join(root, 'src/application/community/index.js'), 'utf8');

assert.equal(session.includes('getRetainedMessage()'), true);
assert.equal(pairFactory.includes('getRetainedMessage'), false);
assert.equal(application.includes('GuidePublicationResourceSession'), false);
assert.equal(application.includes('discord.js'), false);
console.log('Community guide Pair retained-message preparation boundary passed');
