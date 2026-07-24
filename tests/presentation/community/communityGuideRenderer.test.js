const assert = require('node:assert/strict');
const { renderCommunityGuide } = require('../../../src/presentation/community/communityGuideRenderer');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

const payload = renderCommunityGuide(baseline.guideViewModel);
const embed = payload.embeds[0].toJSON();
assert.match(embed.timestamp, /^\d{4}-\d{2}-\d{2}T/);
delete embed.timestamp;
if (embed.footer?.icon_url === undefined) delete embed.footer.icon_url;
assert.deepEqual(embed, baseline.embedWithoutTimestamp);
assert.deepEqual(payload.components.map((row) => row.toJSON()), baseline.componentPayload);
console.log('Community Guide renderer tests passed.');
