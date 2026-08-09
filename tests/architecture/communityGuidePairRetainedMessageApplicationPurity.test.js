const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/application/community/index.js'), 'utf8');
assert.equal(source.includes('getRetainedMessage'), false);
assert.equal(source.includes('GuidePublicationResourceSession'), false);
assert.equal(source.includes('discord.js'), false);
console.log('Guide Pair retained-message application purity passed');
