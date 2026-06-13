const { fromThrowable, ok } = require('../../core/result');
const legacyBuilder = require('../../systems/communityV3Builder');

function previewV3(guild, requestedById) {
  try {
    const plan = legacyBuilder.buildCommunityV3Plan(guild, requestedById);
    return ok({ plan, embed: legacyBuilder.buildV3PreviewEmbed(plan) });
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_V3_PREVIEW_FAILED');
  }
}

async function executeV3(guild, plan, client) {
  try {
    return ok(await legacyBuilder.executeCommunityV3(guild, plan, client));
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_V3_EXECUTE_FAILED');
  }
}

module.exports = { executeV3, previewArchitecture: previewV3, previewV3 };
