const assert = require('node:assert/strict');
const { Collection, ChannelType } = require('discord.js');
const { ensureGuideChannel, ensureRoadmapChannel } = require('../../fakes/community/FakeCommunityChannelSetupBoundaryCandidate');

function createGuild(initial = []) {
  const calls = [];
  const cache = new Collection(initial.map((item) => [item.id, item]));
  let next = 0;
  return {
    channels: {
      cache,
      create: async (spec) => {
        calls.push({ operation: 'create', spec });
        const channel = {
          id: `created-${++next}`, name: spec.name, type: spec.type, parentId: spec.parent || null,
          permissionOverwrites: { set: async (...args) => calls.push({ operation: 'permission', args }) },
          setParent: async (...args) => calls.push({ operation: 'parent', args })
        };
        cache.set(channel.id, channel);
        return channel;
      }
    }, calls
  };
}

void (async () => {
  const overwrite = [{ id: 'everyone', deny: ['ViewChannel'] }];
  const category = { id: 'category', name: '入口', type: ChannelType.GuildCategory };
  const existingGuide = { id: 'guide', name: '導覽', type: ChannelType.GuildText, parentId: 'category', permissionOverwrites: { set: async () => {} } };
  const existingGuild = createGuild([category, existingGuide]);
  assert.equal(await ensureGuideChannel({ guild: existingGuild, categoryName: '入口', channelName: '導覽', overwrites: overwrite }), existingGuide);
  assert.equal(existingGuild.calls.length, 0);

  const missingGuild = createGuild([]);
  const guide = await ensureGuideChannel({ guild: missingGuild, categoryName: '入口', channelName: '導覽', overwrites: overwrite });
  assert.equal(guide.type, ChannelType.GuildText);
  assert.deepEqual(missingGuild.calls.map((item) => item.operation), ['create', 'create', 'permission']);

  const roadmapGuild = createGuild([]);
  await ensureRoadmapChannel({ guild: roadmapGuild, categoryName: '活動', channelName: 'Roadmap' });
  assert.deepEqual(roadmapGuild.calls.map((item) => item.operation), ['create', 'create']);

  const failedGuild = createGuild([]);
  failedGuild.channels.create = async () => { throw new Error('category create failed'); };
  await assert.rejects(() => ensureGuideChannel({ guild: failedGuild, categoryName: '入口', channelName: '導覽', overwrites: overwrite }), /category create failed/);
  console.log('Channel setup candidate characterizes existing reuse, create count, best-effort permission, and failure semantics.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
