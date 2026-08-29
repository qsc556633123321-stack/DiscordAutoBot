const path = require('node:path');
const { readJson, updateJson } = require('./jsonStore');

const GOVERNANCE_EXECUTION_TRANSACTIONS_FILE = path.join(__dirname, '..', '..', 'data', 'server-governance-execution-transactions.json');
const EMPTY_ROOT = Object.freeze({ schemaVersion: 1, guilds: {} });
function normalize(value) { return value && typeof value === 'object' && !Array.isArray(value) ? { schemaVersion: 1, guilds: value.guilds && typeof value.guilds === 'object' ? value.guilds : {} } : { schemaVersion: 1, guilds: {} }; }
function createJsonGovernanceExecutionTransactionStore({ filePath = GOVERNANCE_EXECUTION_TRANSACTIONS_FILE, store = { readJson, updateJson } } = {}) {
  const read = () => normalize(store.readJson(filePath, EMPTY_ROOT));
  const update = (updater) => store.updateJson(filePath, (root) => updater(normalize(root)), EMPTY_ROOT);
  const active = new Set(['PENDING', 'VERIFYING', 'LOCKED', 'EXECUTING', 'ROLLING_BACK']);
  return Object.freeze({
    acquireLock({ guildId, planFingerprint }) { let acquired = false; update((root) => { const guild = root.guilds[guildId] || { transactions: [], audit: [], lock: null }; if (!guild.lock) { root.guilds[guildId] = { ...guild, lock: { planFingerprint, acquiredAt: new Date().toISOString() } }; acquired = true; } return root; }); return acquired; },
    releaseLock({ guildId }) { update((root) => { const guild = root.guilds[guildId] || { transactions: [], audit: [] }; root.guilds[guildId] = { ...guild, lock: null }; return root; }); },
    findSucceededPlan({ guildId, planFingerprint }) { return (read().guilds[guildId]?.transactions || []).find((item) => item.planFingerprint === planFingerprint && item.status === 'SUCCEEDED') || null; },
    findActiveTransaction({ guildId }) { return (read().guilds[guildId]?.transactions || []).find((item) => active.has(item.status)) || null; },
    createTransaction({ transaction }) { update((root) => { const guild = root.guilds[transaction.guildId] || { transactions: [], audit: [], lock: null }; root.guilds[transaction.guildId] = { ...guild, transactions: [...guild.transactions, { ...transaction }] }; return root; }); },
    updateTransaction({ transactionId, patch }) { update((root) => { for (const [guildId, guild] of Object.entries(root.guilds)) { const index = guild.transactions.findIndex((item) => item.transactionId === transactionId); if (index >= 0) { const transactions = [...guild.transactions]; transactions[index] = { ...transactions[index], ...patch, updatedAt: new Date().toISOString() }; root.guilds[guildId] = { ...guild, transactions }; break; } } return root; }); },
    recordAudit({ guildId, ...event }) { update((root) => { const guild = root.guilds[guildId] || { transactions: [], audit: [], lock: null }; root.guilds[guildId] = { ...guild, audit: [...guild.audit, { guildId, ...event }] }; return root; }); },
    recoverInterrupted({ guildId }) { let recovered = 0; update((root) => { const guild = root.guilds[guildId] || { transactions: [], audit: [], lock: null }; const transactions = guild.transactions.map((item) => active.has(item.status) ? (recovered += 1, { ...item, status: 'INTERRUPTED_REQUIRES_REVIEW', updatedAt: new Date().toISOString() }) : item); root.guilds[guildId] = { ...guild, transactions, lock: null, audit: recovered ? [...guild.audit, { guildId, event: 'INTERRUPTED_REQUIRES_REVIEW', timestamp: new Date().toISOString() }] : guild.audit }; return root; }); return recovered; },
    listTransactions({ guildId }) { return Object.freeze([...(read().guilds[guildId]?.transactions || [])]); },
    listAudit({ guildId }) { return Object.freeze([...(read().guilds[guildId]?.audit || [])]); }
  });
}
module.exports = { GOVERNANCE_EXECUTION_TRANSACTIONS_FILE, createJsonGovernanceExecutionTransactionStore };
