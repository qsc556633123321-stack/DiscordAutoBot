const { fromThrowable, ok } = require('../../core/result');
const legacyBuilder = require('../../systems/communityV3Builder');
const bootstrap = require('../../systems/communityBootstrapSystem');
const polisher = require('../../systems/serverPolisher');
const architect = require('../../systems/communityArchitect');

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

async function runBootstrap(guild, options = {}) {
  try {
    const summary = await bootstrap.bootstrapCommunity(guild, options);
    return ok({ summary, embed: bootstrap.buildSummaryEmbed('Community Bootstrap', summary) });
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_BOOTSTRAP_FAILED');
  }
}

async function rebuildLayout(guild, options = {}) {
  try {
    const summary = await bootstrap.rebuildCommunityLayout(guild, options);
    return ok({ summary, embed: bootstrap.buildSummaryEmbed('Rebuild Community Layout', summary) });
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_LAYOUT_REBUILD_FAILED');
  }
}

function buildPolishPlan(guild, options = {}) {
  try {
    const plan = polisher.buildPolishPlan(guild, options);
    return ok({ plan, embed: polisher.buildPolishEmbed(plan) });
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_POLISH_PLAN_FAILED');
  }
}

async function buildArchitectPlan(guild, options = {}) {
  try {
    return ok(await architect.buildCommunityArchitectPlan(guild, options));
  } catch (error) {
    return fromThrowable(error, 'COMMUNITY_ARCHITECT_FAILED');
  }
}

module.exports = {
  architectBuildDiagnoseEmbed: architect.buildDiagnoseEmbed,
  architectBuildPreviewEmbed: architect.buildPreviewEmbed,
  buildArchitectPlan,
  buildPolishPlan,
  executeV3,
  getArchitectPlan: architect.getCommunityArchitectPlan,
  polishSavePlan: polisher.savePolishPlan,
  previewArchitecture: previewV3,
  previewV3,
  rebuildLayout,
  runBootstrap,
  saveV3Plan: legacyBuilder.saveV3Plan,
  saveArchitectPlan: architect.saveCommunityArchitectPlan
};
