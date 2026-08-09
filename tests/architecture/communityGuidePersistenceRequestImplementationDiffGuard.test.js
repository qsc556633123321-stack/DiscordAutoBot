const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const index = fs.readFileSync(path.join(root, 'src/application/community/index.js'), 'utf8');
assert.match(index, /guidePublication\/GuidePersistenceRequest/);
assert.match(index, /createGuidePersistenceRequest/);
assert.match(index, /mapGuidePersistenceRequestToGenericInput/);
for (const unchanged of [
  'src/composition/communityPublicationStateFeature.js',
  'src/application/community/persistCommunityPublicationRecordUseCase.js',
  'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, unchanged)), true);
console.log('Guide request implementation scope is limited to the Application module and its index export.');
