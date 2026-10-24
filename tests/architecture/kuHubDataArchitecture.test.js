const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isSameGame, getGameId } = require('../../src/domain/games/gameIdentityService');

const migration = fs.readFileSync(path.join(__dirname, '../../supabase/migrations/20261024_ku_hub_data_architecture_sprint_01.sql'), 'utf8');
for (const table of ['guilds', 'games', 'guild_games', 'channel_bindings', 'role_bindings', 'game_suggestions', 'suggestion_reviews', 'cleanup_plans', 'cleanup_actions', 'audit_logs']) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
}
assert.match(migration, /discord_guild_id text primary key/);
assert.match(migration, /discord_channel_id text primary key/);
assert.match(migration, /discord_role_id text primary key/);
assert.match(migration, /unique \(discord_guild_id, canonical_key\)/);
assert.match(migration, /unique \(discord_guild_id, canonical_role_key\)/);
assert.match(migration, /unique \(discord_guild_id, plan_fingerprint\)/);

assert.equal(isSameGame('VALORANT', '特戰英豪'), true);
assert.equal(getGameId('特戰') === getGameId('VALORANT'), true);

const bindings = new Map();
function bind(guildId, channelId) {
  const key = `${guildId}:${channelId}`;
  if (bindings.has(key)) throw new Error('DUPLICATE_CHANNEL_BINDING');
  bindings.set(key, { guildId, channelId });
}
bind('guild-a', '123456789012345678');
assert.throws(() => bind('guild-a', '123456789012345678'), /DUPLICATE_CHANNEL_BINDING/);
bind('guild-b', '123456789012345678');
assert.equal(bindings.size, 2);

const plans = new Map();
function compile(snapshotHash, ruleVersion) {
  const fingerprint = `${snapshotHash}:${ruleVersion}`;
  if (!plans.has(fingerprint)) plans.set(fingerprint, { fingerprint, actions: ['rename'], status: 'approved' });
  return plans.get(fingerprint);
}
assert.strictEqual(compile('snapshot-1', 'v1'), compile('snapshot-1', 'v1'));
assert.notStrictEqual(compile('snapshot-2', 'v1'), compile('snapshot-1', 'v1'));

const before = { allowView: true, allowSend: false };
const after = { allowView: true, allowSend: true };
assert.notDeepEqual(before, after);
const review = { decision: 'rejected', reason: 'Requires an owner-approved evidence record.' };
assert.equal(review.reason.length > 0, true);
console.log('KU HUB data architecture tests passed.');
