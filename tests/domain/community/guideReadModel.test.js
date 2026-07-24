const assert = require('node:assert/strict');
const { buildCommunityGuideStatusViewModel, buildCommunityGuideViewModel } = require('../../../src/domain/community/guideReadModel');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

assert.deepEqual(buildCommunityGuideViewModel({ content: baseline.guideContent, guildFacts: baseline.guildFacts }), baseline.guideViewModel);
assert.deepEqual(buildCommunityGuideViewModel({ content: { ...baseline.guideContent, sections: [] }, guildFacts: {} }).guide.sections, []);
assert.deepEqual(buildCommunityGuideStatusViewModel({ status: baseline.statusRecord, guildFacts: baseline.guildFacts }), baseline.statusViewModel);
assert.deepEqual(buildCommunityGuideStatusViewModel({}), { guideChannelId: null, guideMessageId: null, roadmapChannelId: null, roadmapMessageId: null, guideChannelFound: false, roadmapChannelFound: false });
console.log('Community Guide read-model domain tests passed.');
