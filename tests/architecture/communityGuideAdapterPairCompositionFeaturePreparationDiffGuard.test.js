const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

assert.equal(fs.existsSync(path.join(root, 'src/application/community/createCommunityGuidePublicationFeature.js')), false);
console.log('Guide adapter pair composition feature preparation diff guard passed');
