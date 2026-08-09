const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const relativePath of [
  'src/application/community/persistCommunityPublicationRecordUseCase.js',
  'src/application/community/ports/communityPublicationRecordRepository.js',
  'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js',
  'src/composition/communityPublicationStateFeature.js'
]) {
  const source = fs.readFileSync(path.resolve(__dirname, '../..', relativePath), 'utf8');
  assert.doesNotMatch(source, /RoadmapPublicationPersistenceRequest|mapRoadmapPublicationPersistence/);
}
console.log('Generic publication persistence remains independent of the Roadmap request contract');
