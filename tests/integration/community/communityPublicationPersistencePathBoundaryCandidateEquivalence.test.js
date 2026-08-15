const assert = require('node:assert/strict');
const {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE
} = require('../../../src/infrastructure/community/communityPublicationStateFilesystemAdapter');
const { createCommunityPublicationStateFeature } = require('../../../src/composition/communityPublicationStateFeature');
const { createCommunityGuidePersistenceFeature } = require('../../../src/composition/communityGuidePersistenceFeature');
const { createCommunityRoadmapPersistenceFeature } = require('../../../src/composition/communityRoadmapPersistenceFeature');
const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');
const { createRoadmapPublicationPersistenceRequest } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');
const { createFakeDefaultCommunityPublicationPersistenceFeature } = require('../../fakes/community/FakeDefaultCommunityPublicationPersistenceFeature');

function createFilesystem({ root = { unrelated: { keep: true }, guild: { prior: true } }, missing = false, malformed = false, readError, writeError } = {}) {
  let content = malformed ? '{bad' : JSON.stringify(root);
  const existing = { [DEFAULT_DATA_DIRECTORY]: !missing, [DEFAULT_ONBOARDING_FILE]: !missing };
  const calls = [];
  return {
    calls,
    existsSync(target) { calls.push(['exists', target]); return Boolean(existing[target]); },
    mkdirSync(target, options) { calls.push(['mkdir', target, options]); existing[target] = true; },
    writeFileSync(target, value, encoding) {
      calls.push(['write', target, value, encoding]);
      if (writeError) throw writeError;
      existing[target] = true;
      content = value;
    },
    readFileSync(target, encoding) {
      calls.push(['read', target, encoding]);
      if (readError) throw readError;
      return content;
    },
    root() { return JSON.parse(content); }
  };
}

function createExplicitFeature(filesystem, logs) {
  return createCommunityPublicationStateFeature({
    dataDirectory: DEFAULT_DATA_DIRECTORY,
    filePath: DEFAULT_ONBOARDING_FILE,
    filesystem,
    logger: { error: (...args) => logs.push(args) },
    now: () => 'STAMP'
  });
}

function createDefaultFeature(filesystem, logs) {
  return createFakeDefaultCommunityPublicationPersistenceFeature({
    filesystem,
    logger: { error: (...args) => logs.push(args) },
    now: () => 'STAMP'
  });
}

function persistGuideAndRoadmap(feature) {
  const guide = createCommunityGuidePersistenceFeature({ communityPublicationStateFeature: feature });
  const roadmap = createCommunityRoadmapPersistenceFeature({ communityPublicationStateFeature: feature });
  const guideResult = guide.persist(createGuidePersistenceRequest({
    guildId: 'guild', channelId: 'guide-channel', messageId: 'guide-message',
    nativeTaskRecommendations: ['welcome'], nativeTaskExcludedChannels: ['voice']
  }));
  const roadmapResult = roadmap.persist(createRoadmapPublicationPersistenceRequest({
    guildId: 'guild', channelId: 'roadmap-channel', messageId: 'roadmap-message'
  }));
  return { guideResult, roadmapResult };
}

for (const options of [{}, { missing: true }, { malformed: true }, { readError: new Error('read failed') }]) {
  const explicitLogs = [];
  const defaultLogs = [];
  const explicitFilesystem = createFilesystem(options);
  const defaultFilesystem = createFilesystem(options);
  const explicit = persistGuideAndRoadmap(createExplicitFeature(explicitFilesystem, explicitLogs));
  const candidate = persistGuideAndRoadmap(createDefaultFeature(defaultFilesystem, defaultLogs));

  assert.deepEqual(candidate, explicit);
  assert.deepEqual(defaultFilesystem.calls, explicitFilesystem.calls);
  assert.deepEqual(defaultLogs, explicitLogs);
  assert.deepEqual(defaultFilesystem.root(), explicitFilesystem.root());
  const root = defaultFilesystem.root();
  if (!options.writeError && !options.readError) {
    assert.equal(root.guild.guideMessageId, 'guide-message');
    assert.equal(root.guild.roadmapMessageId, 'roadmap-message');
  }
  if (!options.missing && !options.malformed && !options.readError && !options.writeError) {
    assert.equal(root.guild.prior, true);
    assert.deepEqual(root.unrelated, { keep: true });
  }
}

{
  const explicitLogs = [];
  const defaultLogs = [];
  const explicitFilesystem = createFilesystem({ writeError: new Error('write failed') });
  const defaultFilesystem = createFilesystem({ writeError: new Error('write failed') });
  const explicit = persistGuideAndRoadmap(createExplicitFeature(explicitFilesystem, explicitLogs));
  const candidate = persistGuideAndRoadmap(createDefaultFeature(defaultFilesystem, defaultLogs));
  assert.deepEqual(candidate, explicit);
  assert.equal(candidate.guideResult.persisted, false);
  assert.equal(candidate.roadmapResult.persisted, false);
  assert.deepEqual(defaultFilesystem.calls, explicitFilesystem.calls);
  assert.deepEqual(defaultLogs, explicitLogs);
}

console.log('Default publication persistence paths are equivalent to the runtime explicit path construction.');
