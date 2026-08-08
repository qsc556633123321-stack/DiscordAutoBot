const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..', '..', '..');
const source = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js'), 'utf8');

for (const forbidden of ['GuidePublicationMessageLookupPort', 'GuidePublicationMessageMutationPort', 'src/application', 'require(\'../../application']) {
  assert.equal(source.includes(forbidden), false, forbidden);
}
console.log('Guide publication production resource session port separation passed');
