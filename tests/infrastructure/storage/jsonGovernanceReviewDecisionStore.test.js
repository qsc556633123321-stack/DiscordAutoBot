const assert = require('node:assert/strict');
const { createJsonGovernanceReviewDecisionStore } = require('../../../src/infrastructure/storage/jsonGovernanceReviewDecisionStore');

let root = {};
const store = createJsonGovernanceReviewDecisionStore({
  filePath: 'memory.json',
  store: {
    readJson: () => structuredClone(root),
    updateJson: (_path, updater) => { root = updater(structuredClone(root)); return root; }
  }
});
const first = { guildId: 'guild-a', resourceId: 'resource-a', resourceFingerprint: 'fingerprint-a', resourceNameAtDecision: 'A', parentIdAtDecision: null, decision: 'KEEP', canonicalTargetKey: null, reasonAtDecision: 'reason', decidedBy: 'admin-a', decidedAt: '2026-01-01T00:00:00.000Z', schemaVersion: 1 };
const second = { ...first, resourceId: 'resource-b', decision: 'DELETE', decidedAt: '2026-01-02T00:00:00.000Z' };
store.saveDecision({ record: first, actorId: 'admin-a' });
store.saveDecision({ record: second, actorId: 'admin-b' });
assert.equal(store.listDecisions({ guildId: 'guild-a' }).length, 2);
assert.equal(store.listDecisions({ guildId: 'guild-b' }).length, 0);
assert.equal(store.removeDecision({ guildId: 'guild-a', resourceId: 'resource-a', actorId: 'admin-a' }), true);
assert.equal(store.listDecisions({ guildId: 'guild-a' }).length, 1);
assert.equal(store.listAudit({ guildId: 'guild-a' }).length, 3);
assert.equal(store.listAudit({ guildId: 'guild-a' })[2].newDecision, null);
console.log('JSON governance review decision store tests passed.');
