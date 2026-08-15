const assert = require('node:assert/strict');
const { Collection, ChannelType } = require('discord.js');
const {
  createCommunityChannelSetupCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityChannelSetupCompatibilityAdapter');

function createGuild(initial = [], createFailure) {
  const calls = [];
  const cache = new Collection(initial.map((channel) => [channel.id, channel]));
  let created = 0;
  const guild = {
    roles: { everyone: { id: 'everyone' }, cache: new Collection() },
    members: { me: { id: 'bot' } },
    channels: {
      cache,
      async create(spec) {
        calls.push({ operation: 'create', spec });
        const failure = createFailure?.(spec, calls);
        if (failure !== undefined) throw failure;
        const channel = createChannel({
          id: `created-${++created}`,
          name: spec.name,
          type: spec.type,
          parentId: spec.parent || null,
          calls
        });
        cache.set(channel.id, channel);
        return channel;
      }
    }
  };
  return { guild, calls };
}

function createChannel({ id, name, type, parentId = null, calls, parentFailure, overwriteFailure }) {
  return {
    id,
    name,
    type,
    parentId,
    async setParent(...args) {
      calls.push({ operation: 'parent', args });
      if (parentFailure !== undefined) throw parentFailure;
      this.parentId = args[0];
      return this;
    },
    permissionOverwrites: {
      async set(...args) {
        calls.push({ operation: 'overwrite', args });
        if (overwriteFailure !== undefined) throw overwriteFailure;
      }
    }
  };
}

void (async () => {
  const category = createChannel({ id: 'entry', name: 'Entry', type: ChannelType.GuildCategory, calls: [] });
  const correctGuideCalls = [];
  const correctGuide = createChannel({ id: 'guide', name: 'Guide', type: ChannelType.GuildText, parentId: 'entry', calls: correctGuideCalls });
  const existing = createGuild([category, correctGuide]);
  const existingAdapter = createCommunityChannelSetupCompatibilityAdapter({ guild: existing.guild, onboardingVisible: () => [] });
  assert.equal(Object.isFrozen(existingAdapter), true);
  assert.strictEqual(await existingAdapter.ensureCategory({ name: 'Entry' }), category);
  assert.strictEqual(await existingAdapter.ensureGuideChannel({ categoryName: 'Entry', channelName: 'Guide' }), correctGuide);
  assert.deepEqual(existing.calls.map((call) => call.operation), []);
  assert.deepEqual(correctGuideCalls.map((call) => call.operation), ['overwrite']);

  const wrongParentCalls = [];
  const wrongParentGuide = createChannel({ id: 'guide', name: 'Guide', type: ChannelType.GuildText, parentId: 'wrong', calls: wrongParentCalls });
  const moved = createGuild([category, wrongParentGuide]);
  assert.strictEqual(await createCommunityChannelSetupCompatibilityAdapter({ guild: moved.guild, onboardingVisible: () => [] })
    .ensureGuideChannel({ categoryName: 'Entry', channelName: 'Guide' }), wrongParentGuide);
  assert.deepEqual(wrongParentCalls.map((call) => call.operation), ['parent', 'overwrite']);

  const overwriteCalls = [];
  const overwriteFailureGuide = createChannel({ id: 'guide', name: 'Guide', type: ChannelType.GuildText, parentId: 'entry', calls: overwriteCalls, overwriteFailure: 'overwrite failure' });
  const overwriteFailureGuild = createGuild([category, overwriteFailureGuide]);
  assert.strictEqual(await createCommunityChannelSetupCompatibilityAdapter({ guild: overwriteFailureGuild.guild, onboardingVisible: () => [] })
    .ensureGuideChannel({ categoryName: 'Entry', channelName: 'Guide' }), overwriteFailureGuide);
  assert.deepEqual(overwriteCalls.map((call) => call.operation), ['overwrite']);

  const parentCalls = [];
  const parentFailure = { sentinel: 'parent failure' };
  const parentFailureGuide = createChannel({ id: 'guide', name: 'Guide', type: ChannelType.GuildText, parentId: 'wrong', calls: parentCalls, parentFailure });
  const parentFailureGuild = createGuild([category, parentFailureGuide]);
  await assert.rejects(
    () => createCommunityChannelSetupCompatibilityAdapter({ guild: parentFailureGuild.guild, onboardingVisible: () => [] })
      .ensureGuideChannel({ categoryName: 'Entry', channelName: 'Guide' }),
    (error) => error === parentFailure
  );
  assert.deepEqual(parentCalls.map((call) => call.operation), ['parent']);

  const missingGuide = createGuild();
  const createdGuide = await createCommunityChannelSetupCompatibilityAdapter({ guild: missingGuide.guild, onboardingVisible: () => [] })
    .ensureGuideChannel({ categoryName: 'Entry', channelName: 'Guide' });
  assert.equal(createdGuide.type, ChannelType.GuildText);
  assert.deepEqual(missingGuide.calls.map((call) => call.operation), ['create', 'create', 'overwrite']);
  assert.equal(missingGuide.calls[0].spec.reason, 'Community concierge setup');
  assert.equal(missingGuide.calls[1].spec.reason, 'Community guide setup');

  const roadmapCategory = createChannel({ id: 'games', name: 'Games', type: ChannelType.GuildCategory, calls: [] });
  const roadmapCalls = [];
  const misplacedRoadmap = createChannel({ id: 'roadmap', name: 'Roadmap', type: ChannelType.GuildText, parentId: 'wrong', calls: roadmapCalls });
  const existingRoadmap = createGuild([roadmapCategory, misplacedRoadmap]);
  assert.strictEqual(await createCommunityChannelSetupCompatibilityAdapter({ guild: existingRoadmap.guild, onboardingVisible: () => [] })
    .ensureRoadmapChannel({ categoryName: 'Games', channelName: 'Roadmap' }), misplacedRoadmap);
  assert.deepEqual(existingRoadmap.calls, []);
  assert.deepEqual(roadmapCalls, []);

  const missingRoadmap = createGuild();
  const createdRoadmap = await createCommunityChannelSetupCompatibilityAdapter({ guild: missingRoadmap.guild, onboardingVisible: () => [] })
    .ensureRoadmapChannel({ categoryName: 'Games', channelName: 'Roadmap' });
  assert.equal(createdRoadmap.type, ChannelType.GuildText);
  assert.deepEqual(missingRoadmap.calls.map((call) => call.operation), ['create', 'create']);

  const partialFailure = { sentinel: 'child create failure' };
  const failedChild = createGuild([], (spec, calls) => calls.length === 2 ? partialFailure : undefined);
  await assert.rejects(
    () => createCommunityChannelSetupCompatibilityAdapter({ guild: failedChild.guild, onboardingVisible: () => [] })
      .ensureRoadmapChannel({ categoryName: 'Games', channelName: 'Roadmap' }),
    (error) => error === partialFailure
  );
  assert.deepEqual(failedChild.calls.map((call) => call.operation), ['create', 'create']);

  const duplicate = createGuild([
    createChannel({ id: 'wrong-type', name: 'Guide', type: ChannelType.GuildVoice, calls: [] }),
    createChannel({ id: 'case', name: 'guide', type: ChannelType.GuildText, calls: [] }),
    createChannel({ id: 'space', name: 'Guide ', type: ChannelType.GuildText, calls: [] })
  ]);
  await createCommunityChannelSetupCompatibilityAdapter({ guild: duplicate.guild, onboardingVisible: () => [] })
    .ensureGuideChannel({ categoryName: 'Entry', channelName: 'Guide' });
  assert.deepEqual(duplicate.calls.map((call) => call.operation), ['create', 'create', 'overwrite']);

  console.log('Community channel setup adapter preserves exact lookup, creation, parent, overwrite, identity, and partial-failure contracts.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
