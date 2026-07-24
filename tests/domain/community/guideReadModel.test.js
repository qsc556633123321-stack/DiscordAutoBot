const assert = require('node:assert/strict');
const { buildCommunityGuideViewModel } = require('../../../src/domain/community/guideReadModel');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

assert.deepEqual(buildCommunityGuideViewModel({ content: baseline.guideContent, guildName: baseline.guild.name }), baseline.guideViewModel);
assert.deepEqual(buildCommunityGuideViewModel({ content: { ...baseline.guideContent, sections: [] }, guildName: '' }).guide.sections, []);
console.log('Community Guide read-model domain tests passed.');
