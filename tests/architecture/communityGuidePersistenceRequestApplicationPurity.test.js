const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/application/community/guidePublication/GuidePersistenceRequest.js'), 'utf8');
assert.doesNotMatch(source, /require\(|discord\.js|node:fs|writeFile|readFile|saveOnboarding|FilesystemAdapter|Repository|communityConcierge|RoadmapPublicationPersistenceRequest|updatedAt|persisted|record/);
for (const absent of [
  'src/application/community/guidePublication/GuidePersistencePort.js',
  'src/application/community/guidePublication/GuidePersistenceRepository.js',
  'src/infrastructure/community/GuidePersistenceFilesystemAdapter.js',
  'src/infrastructure/community/GuidePersistenceWriter.js'
]) assert.equal(fs.existsSync(path.join(root, absent)), false, `${absent} must remain absent`);
console.log('Guide persistence request is pure and introduces no Port, repository, or writer.');
