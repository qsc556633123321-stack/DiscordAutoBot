const path = require('node:path');
const { fail, ok } = require('../../core/result');
const { readJsonStrict, writeJsonAtomic } = require('./jsonStore');

const COMMUNITY_SNAPSHOTS_FILE = path.join(__dirname, '..', '..', 'data', 'community-snapshots.json');
const EMPTY_ROOT = Object.freeze({ schemaVersion: 1, guilds: {} });

function normalizeRoot(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? { schemaVersion: 1, guilds: value.guilds && typeof value.guilds === 'object' ? value.guilds : {} } : { schemaVersion: 1, guilds: {} };
}

function createJsonCommunitySnapshotRepository({ filePath = COMMUNITY_SNAPSHOTS_FILE, store = { readJsonStrict, writeJsonAtomic } } = {}) {
  const read = () => normalizeRoot(store.readJsonStrict(filePath, EMPTY_ROOT));
  return Object.freeze({
    saveSnapshot({ snapshot } = {}) {
      try {
        const root = read();
        const guild = root.guilds[snapshot.guildId] || { snapshots: {}, latestSnapshotId: null };
        const existing = guild.snapshots[snapshot.snapshotId];
        if (existing) return ok(Object.freeze({ snapshot: existing, created: false }));
        const next = { ...root, guilds: { ...root.guilds, [snapshot.guildId]: { snapshots: { ...guild.snapshots, [snapshot.snapshotId]: snapshot }, latestSnapshotId: snapshot.snapshotId } } };
        store.writeJsonAtomic(filePath, next);
        return ok(Object.freeze({ snapshot, created: true }));
      } catch (error) { return fail('SNAPSHOT_PERSISTENCE_FAILED', error.message); }
    },
    loadLatestSnapshot({ guildId } = {}) {
      try {
        const guild = read().guilds[guildId];
        return ok(guild?.latestSnapshotId ? guild.snapshots[guild.latestSnapshotId] : null);
      } catch (error) { return fail('SNAPSHOT_READ_FAILED', error.message); }
    }
  });
}

module.exports = { COMMUNITY_SNAPSHOTS_FILE, createJsonCommunitySnapshotRepository };
