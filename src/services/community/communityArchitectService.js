const legacy = require('../../systems/communityArchitect');
const { fromThrowable, ok } = require('../../core/result');

async function buildPlan(guild, options) {
  try {
    return ok(await legacy.buildCommunityArchitectPlan(guild, options));
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_ARCHITECT_FAILED');
  }
}

module.exports = { buildPlan };
