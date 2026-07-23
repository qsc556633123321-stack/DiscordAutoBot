const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCommunityRoadmapGateway, DEFAULT_COMMUNITY_ROADMAP } = require('../../../src/infrastructure/community/communityRoadmapGateway');
const { createFakeLogger } = require('../../fixtures/communityRoadmapFakes');

const fixture = (name) => fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'community', name), 'utf8');
const validGateway = createCommunityRoadmapGateway({ readFile: () => fixture('roadmap.valid.json') });
assert.deepEqual(validGateway.getCommunityRoadmap().completed, ['First completed', 'Second completed']);

const emptyGateway = createCommunityRoadmapGateway({ readFile: () => fixture('roadmap.empty.json') });
assert.deepEqual(emptyGateway.getCommunityRoadmap(), { completed: [], inProgress: [], future: [] });

const logger = createFakeLogger();
const malformedGateway = createCommunityRoadmapGateway({ readFile: () => fixture('roadmap.malformed.json'), logger });
assert.deepEqual(malformedGateway.getCommunityRoadmap(), DEFAULT_COMMUNITY_ROADMAP);
assert.equal(logger.entries.length, 1);

const missingLogger = createFakeLogger();
const missingGateway = createCommunityRoadmapGateway({
  readFile: () => { const error = new Error('missing'); error.code = 'ENOENT'; throw error; },
  logger: missingLogger
});
assert.deepEqual(missingGateway.getCommunityRoadmap(), DEFAULT_COMMUNITY_ROADMAP);
assert.equal(missingLogger.entries.length, 0);
console.log('Community Roadmap gateway tests passed.');
