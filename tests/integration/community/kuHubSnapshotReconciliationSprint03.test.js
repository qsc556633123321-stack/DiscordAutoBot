const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCommunitySnapshot } = require('../../../src/domain/community/communitySnapshot');
const { ReconciliationStatus, reconcileCommunity } = require('../../../src/domain/community/communityReconciliation');
const { createJsonCommunitySnapshotRepository } = require('../../../src/infrastructure/storage/jsonCommunitySnapshotRepository');
const { createCommunityReconciliationPreviewUseCase } = require('../../../src/application/community/createCommunityReconciliationPreviewUseCase');

const guildId = '90071992547409930';
const category = { id: '90071992547409931', name: '🎮｜VALORANT', type: 'category', parentId: null, permissionOverwrites: [] };
const channel = { id: '90071992547409932', name: '💬｜聊天', type: 'text', parentId: category.id, permissionOverwrites: [{ id: '90071992547409933', type: 0, allow: '1', deny: '0' }] };
const schema = { resources: [{ key: 'category:game:valorant', displayName: '🎮｜VALORANT', type: 'category', parentKey: null }, { key: 'channel:game:valorant:chat', displayName: '💬｜聊天', type: 'text', parentKey: 'category:game:valorant', accessProfile: 'specific_game' }] };
const bindings = [{ discordChannelId: category.id, canonicalKey: 'category:game:valorant' }, { discordChannelId: channel.id, canonicalKey: 'channel:game:valorant:chat', permissionFingerprint: 'outdated' }];

const first = createCommunitySnapshot({ guildId, capturedAt: '2026-10-24T00:00:00.000Z', categories: [category], channels: [channel], roles: [{ id: '90071992547409934', name: 'VALORANT' }] });
const second = createCommunitySnapshot({ guildId, capturedAt: '2026-10-25T00:00:00.000Z', categories: [category], channels: [channel], roles: [{ id: '90071992547409934', name: 'VALORANT' }] });
assert.equal(first.fingerprint, second.fingerprint);
assert.equal(first.snapshotId, second.snapshotId);
assert.equal(first.guildId, guildId);

const temporaryDirectory = fs.mkdtempSync(path.join(__dirname, '../../..', '.tmp-discordautobot-snapshot-'));
const filePath = path.join(temporaryDirectory, 'snapshots.json');
const repository = createJsonCommunitySnapshotRepository({ filePath });
assert.equal(repository.saveSnapshot({ snapshot: first }).ok, true);
assert.equal(repository.saveSnapshot({ snapshot: second }).data.created, false);
assert.equal(repository.loadLatestSnapshot({ guildId }).data.snapshotId, first.snapshotId);
assert.equal(repository.loadLatestSnapshot({ guildId: 'other-guild' }).data, null);
const failingRepository = createJsonCommunitySnapshotRepository({ store: { readJsonStrict: () => { throw new Error('storage offline'); }, writeJsonAtomic: () => undefined } });
assert.equal(failingRepository.saveSnapshot({ snapshot: first }).error.code, 'SNAPSHOT_PERSISTENCE_FAILED');
assert.equal(failingRepository.loadLatestSnapshot({ guildId }).error.code, 'SNAPSHOT_READ_FAILED');

const reconciliation = reconcileCommunity({ snapshot: first, desiredState: schema, channelBindings: bindings });
assert.equal(reconciliation.issues.some((item) => item.status === ReconciliationStatus.MATCHED), true);
assert.equal(reconciliation.issues.some((item) => item.status === ReconciliationStatus.PERMISSION_DRIFT), true);
assert.equal(reconcileCommunity({ snapshot: first, desiredState: schema, channelBindings: [{ discordChannelId: 'missing', canonicalKey: 'channel:game:valorant:chat' }] }).issues.some((item) => item.status === ReconciliationStatus.STALE_BINDING), true);
assert.equal(reconcileCommunity({ snapshot: first, desiredState: schema, channelBindings: [bindings[0], { ...bindings[0], discordChannelId: channel.id }] }).issues.some((item) => item.status === ReconciliationStatus.DUPLICATE_CANDIDATE), true);
const aliasSnapshot = createCommunitySnapshot({ guildId, capturedAt: '2026-10-24T00:00:00.000Z', categories: [{ ...category, gameCanonicalId: 'valorant' }, { ...category, id: '90071992547409935', name: '🎮｜特戰英豪', gameCanonicalId: 'valorant' }], channels: [], roles: [] });
assert.equal(reconcileCommunity({ snapshot: aliasSnapshot, desiredState: { resources: [] }, channelBindings: [] }).issues.some((item) => item.status === ReconciliationStatus.DUPLICATE_CANDIDATE), true);

let discordReads = 0;
const preview = createCommunityReconciliationPreviewUseCase({ snapshotPort: { readGuildSnapshot: async ({ guildId: requestedGuildId }) => { discordReads += 1; return { guildId: requestedGuildId, categories: [category], channels: [channel], roles: [{ id: '90071992547409934', name: 'VALORANT' }] }; } }, snapshotRepository: repository, bindingRepository: { listChannelBindings: async ({ guildId: requestedGuildId }) => requestedGuildId === guildId ? bindings : [] }, desiredState: schema, now: () => '2026-10-24T00:00:00.000Z' });
void (async () => {
  const result = await preview.preview({ guildId });
  assert.equal(result.ok, true);
  assert.equal(result.data.snapshot.fingerprint, first.fingerprint);
  assert.equal(discordReads, 1);
  assert.equal(result.data.reconciliation.issues.some((item) => item.status === ReconciliationStatus.PERMISSION_DRIFT), true);
  const other = await preview.preview({ guildId: '90071992547409999' });
  assert.equal(other.data.channelBindings.length, 0);
  assert.equal(discordReads, 2);
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  console.log('KU HUB Snapshot Reconciliation Sprint 03 integration tests passed.');
})();
