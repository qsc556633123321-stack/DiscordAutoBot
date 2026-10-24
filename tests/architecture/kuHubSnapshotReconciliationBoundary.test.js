const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function source(relativePath) { return fs.readFileSync(path.join(__dirname, '../..', relativePath), 'utf8'); }
const snapshot = source('src/infrastructure/discord/discordGuildSnapshotAdapter.js');
const reconciliation = source('src/domain/community/communityReconciliation.js');
const repository = source('src/infrastructure/storage/jsonCommunitySnapshotRepository.js');
const api = source('apps/api/server.js');

assert.doesNotMatch(snapshot, /\.create\(|\.setName\(|\.setParent\(|\.delete\(|permissionOverwrites\.set/);
assert.doesNotMatch(reconciliation, /\.delete\(|\.setName\(|\.setParent\(/);
assert.doesNotMatch(repository, /discord\.js|token|SUPABASE_SERVICE_ROLE_KEY/);
assert.match(api, /requireManageableGuild\(req, res, req\.params\.guildId\)/);
assert.match(api, /preview\.ok/);
console.log('KU HUB Snapshot Reconciliation boundary tests passed.');
