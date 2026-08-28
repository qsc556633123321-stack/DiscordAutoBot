const path = require('node:path');
const { readJson, updateJson } = require('./jsonStore');

const GOVERNANCE_REVIEW_DECISIONS_FILE = path.join(__dirname, '..', '..', 'data', 'server-governance-review-decisions.json');
const EMPTY_ROOT = Object.freeze({ schemaVersion: 1, guilds: {} });

function normalizeRoot(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? { schemaVersion: 1, guilds: value.guilds && typeof value.guilds === 'object' ? value.guilds : {} } : { schemaVersion: 1, guilds: {} };
}

function createJsonGovernanceReviewDecisionStore({ filePath = GOVERNANCE_REVIEW_DECISIONS_FILE, store = { readJson, updateJson } } = {}) {
  const readRoot = () => normalizeRoot(store.readJson(filePath, EMPTY_ROOT));
  const update = (updater) => store.updateJson(filePath, (current) => updater(normalizeRoot(current)), EMPTY_ROOT);
  return Object.freeze({
    listDecisions({ guildId }) { return Object.freeze(Object.values(readRoot().guilds[guildId]?.decisions || {})); },
    saveDecision({ record, actorId }) {
      let saved;
      update((root) => {
        const guild = root.guilds[record.guildId] || { decisions: {}, audit: [] };
        const old = guild.decisions[record.resourceId] || null;
        saved = { ...record };
        root.guilds[record.guildId] = { decisions: { ...guild.decisions, [record.resourceId]: saved }, audit: [...guild.audit, { guildId: record.guildId, resourceId: record.resourceId, oldDecision: old?.decision || null, newDecision: record.decision, actorId, timestamp: record.decidedAt }] };
        return root;
      });
      return Object.freeze(saved);
    },
    removeDecision({ guildId, resourceId, actorId }) {
      let removed = false;
      update((root) => {
        const guild = root.guilds[guildId] || { decisions: {}, audit: [] };
        const old = guild.decisions[resourceId] || null;
        const decisions = { ...guild.decisions }; delete decisions[resourceId];
        removed = Boolean(old);
        root.guilds[guildId] = { decisions, audit: [...guild.audit, { guildId, resourceId, oldDecision: old?.decision || null, newDecision: null, actorId, timestamp: new Date().toISOString() }] };
        return root;
      });
      return removed;
    },
    listAudit({ guildId }) { return Object.freeze([...(readRoot().guilds[guildId]?.audit || [])]); }
  });
}

module.exports = { GOVERNANCE_REVIEW_DECISIONS_FILE, createJsonGovernanceReviewDecisionStore };
