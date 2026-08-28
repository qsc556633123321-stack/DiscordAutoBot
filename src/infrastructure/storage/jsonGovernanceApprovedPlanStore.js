const path = require('node:path');
const { readJson, updateJson } = require('./jsonStore');

const GOVERNANCE_APPROVED_PLANS_FILE = path.join(__dirname, '..', '..', 'data', 'server-governance-approved-plans.json');
const EMPTY_ROOT = Object.freeze({ schemaVersion: 1, guilds: {} });
function normalize(value) { return value && typeof value === 'object' && !Array.isArray(value) ? { schemaVersion: 1, guilds: value.guilds && typeof value.guilds === 'object' ? value.guilds : {} } : { schemaVersion: 1, guilds: {} }; }
function createJsonGovernanceApprovedPlanStore({ filePath = GOVERNANCE_APPROVED_PLANS_FILE, store = { readJson, updateJson } } = {}) {
  const read = () => normalize(store.readJson(filePath, EMPTY_ROOT));
  const update = (updater) => store.updateJson(filePath, (current) => updater(normalize(current)), EMPTY_ROOT);
  return Object.freeze({
    savePlan({ plan, actorId }) {
      let record;
      update((root) => {
        const guild = root.guilds[plan.guildId] || { plans: [], audit: [] };
        const previouslyActive = guild.plans.filter((item) => item.storageStatus === 'ACTIVE');
        const superseded = guild.plans.map((item) => item.storageStatus === 'ACTIVE' ? { ...item, storageStatus: 'SUPERSEDED' } : item);
        record = Object.freeze({ plan, storageStatus: 'ACTIVE', createdAt: plan.compiledAt, createdBy: actorId });
        root.guilds[plan.guildId] = { plans: [...superseded, record], audit: [...guild.audit, { guildId: plan.guildId, event: 'PLAN_COMPILED', planFingerprint: plan.planFingerprint, actorId, timestamp: plan.compiledAt }, ...previouslyActive.map((item) => ({ guildId: plan.guildId, event: 'PLAN_SUPERSEDED', planFingerprint: item.plan.planFingerprint, actorId, timestamp: plan.compiledAt }))] };
        return root;
      });
      return record;
    },
    loadLatestPlan({ guildId }) { return read().guilds[guildId]?.plans?.findLast((record) => record.storageStatus === 'ACTIVE') || null; },
    listPlans({ guildId }) { return Object.freeze([...(read().guilds[guildId]?.plans || [])]); },
    listAudit({ guildId }) { return Object.freeze([...(read().guilds[guildId]?.audit || [])]); },
    recordVerification({ guildId, planFingerprint, result, actorId = null }) {
      const timestamp = new Date().toISOString();
      update((root) => {
        const guild = root.guilds[guildId] || { plans: [], audit: [] };
        root.guilds[guildId] = { ...guild, audit: [...guild.audit, { guildId, event: result.status === 'VALID' ? 'PLAN_VERIFICATION_PASSED' : 'PLAN_VERIFICATION_FAILED', planFingerprint, actorId, blockers: [...(result.blockers || [])], timestamp }] };
        return root;
      });
    }
  });
}
module.exports = { GOVERNANCE_APPROVED_PLANS_FILE, createJsonGovernanceApprovedPlanStore };
