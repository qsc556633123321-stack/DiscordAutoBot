const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const root = path.resolve(__dirname, '../..'); const factory = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8');
assert.equal(factory.includes('getRetainedMessage'), true); assert.equal(fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8').includes('lookupPort.lookup'), true);
console.log('Runtime lookup redirect refresh boundary passed');
