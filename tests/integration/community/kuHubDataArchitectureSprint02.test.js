const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { createDiscordGuildSnapshotAdapter } = require('../../../src/infrastructure/discord/discordGuildSnapshotAdapter');
const { compareCommunityLayout, DiffAction } = require('../../../src/domain/community/communityLayoutDiffEngine');
const { createCommunityLayoutPreviewUseCase } = require('../../../src/application/community/createCommunityLayoutPreviewUseCase');

const category = { id: '90071992547409931', name: '社群入口', type: ChannelType.GuildCategory, rawPosition: 0, permissionOverwrites: { cache: new Map() } };
const channel = { id: '90071992547409932', name: '歡迎', type: ChannelType.GuildText, parentId: category.id, rawPosition: 1, permissionOverwrites: { cache: new Map([['role', { id: 'role', type: 0, allow: { bitfield: 1n }, deny: { bitfield: 0n } }]]) } };
const role = { id: '90071992547409933', name: '正式成員', position: 2 };
const fakeGuild = { id: '90071992547409930', channels: { fetch: async () => new Map([[category.id, category], [channel.id, channel]]) }, roles: { fetch: async () => new Map([[role.id, role]]) } };

void (async () => {
  const snapshotPort = createDiscordGuildSnapshotAdapter({ resolveGuild: async () => fakeGuild, now: () => '2026-10-24T00:00:00.000Z' });
  const snapshot = await snapshotPort.readGuildSnapshot({ guildId: fakeGuild.id });
  assert.equal(snapshot.guildId, fakeGuild.id);
  assert.equal(snapshot.categories[0].id, category.id);
  assert.equal(snapshot.channels[0].permissionOverwrites[0].allow, '1');
  assert.equal(snapshot.roles[0].id, role.id);

  const schema = { resources: [{ key: 'category:entry', displayName: '社群入口', parentKey: null, accessProfile: null }, { key: 'channel:welcome', displayName: '👋｜新人報到', parentKey: 'category:entry', accessProfile: 'public_entry' }] };
  const bindings = [{ discordChannelId: category.id, canonicalKey: 'category:entry' }, { discordChannelId: channel.id, canonicalKey: 'channel:welcome' }];
  const normalized = snapshot;
  const first = compareCommunityLayout({ snapshot: normalized, schema, channelBindings: bindings });
  const second = compareCommunityLayout({ snapshot: normalized, schema, channelBindings: bindings });
  assert.deepEqual(first, second);
  assert.equal(first.actions.some((item) => item.action === DiffAction.RENAME), true);
  assert.equal(first.actions.some((item) => item.action === DiffAction.PERMISSION_REVIEW), false);
  const permissionReview = compareCommunityLayout({ snapshot: { ...normalized, channels: normalized.channels.map((item) => ({ ...item, accessProfile: 'other' })) }, schema, channelBindings: bindings });
  assert.equal(permissionReview.actions.some((item) => item.action === DiffAction.PERMISSION_REVIEW), true);
  const duplicate = compareCommunityLayout({ snapshot: normalized, schema, channelBindings: [{ discordChannelId: 'missing', canonicalKey: 'channel:welcome' }] });
  assert.equal(duplicate.actions.some((item) => item.action === DiffAction.DUPLICATE_REVIEW), true);
  assert.equal(duplicate.actions.every((item) => item.action !== 'DELETE'), true);

  let reads = 0;
  const useCase = createCommunityLayoutPreviewUseCase({ snapshotPort: { readGuildSnapshot: async ({ guildId }) => { reads += 1; return { ...normalized, guildId }; } }, bindingRepository: { listChannelBindings: async ({ guildId }) => guildId === 'guild-a' ? bindings : [] }, schema });
  const a = await useCase.preview({ guildId: 'guild-a' });
  const b = await useCase.preview({ guildId: 'guild-b' });
  assert.equal(a.channelBindings.length, 2);
  assert.equal(b.channelBindings.length, 0);
  assert.equal(reads, 2);
  console.log('KU HUB Data Architecture Sprint 02 integration tests passed.');
})();
