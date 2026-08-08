const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const applicationFiles = [
  'src/application/community/ports/communityPublicationStateStore.js',
  'src/application/community/communityPublicationPersistenceErrors.js',
  'src/application/community/communityPublicationStateOperations.js',
  'src/application/community/communityPublicationStateMapper.js',
  'src/application/community/applyPublicationPatch.js',
  'src/application/community/ports/communityPublicationRecordRepository.js',
  'src/application/community/persistCommunityPublicationRecordUseCase.js',
];

for (const relativePath of applicationFiles) {
  const source = read(relativePath);
  assert.equal(/require\(['"](?:fs|path|discord\.js)['"]\)/.test(source), false, `${relativePath} must stay pure`);
  assert.equal(/src\/systems|src\/events|src\/commands/.test(source), false, `${relativePath} must not depend on runtime layers`);
}

assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationStateFeature.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationStateRepository.js')), false);

console.log('community publication persistence boundary architecture passed');
