const assert = require('node:assert/strict');
const { Collection, ChannelType } = require('discord.js');
const {
  buildCommunityNonRoleConciergePresentationPayload
} = require('../../../src/modules/community/CommunityNonRoleConciergePresentation');
const {
  buildRoadmapEmbed,
  handleConciergeButton
} = require('../../../src/systems/communityConcierge');

function normalizePayload(payload) {
  return {
    embeds: payload.embeds.map((embed) => {
      const json = embed.toJSON();
      delete json.timestamp;
      return json;
    }),
    ephemeral: payload.ephemeral
  };
}

function createGuild() {
  const channel = (id, name) => ({
    id,
    name,
    type: ChannelType.GuildText,
    toString: () => `<#${id}>`
  });
  return {
    channels: {
      cache: new Collection([
        ['night', channel('night', '深夜聊天')],
        ['voice', channel('voice', '目前語音房')],
        ['ignored', channel('ignored', '公告')]
      ])
    }
  };
}

async function invoke(customId, guild = createGuild()) {
  const replies = [];
  const result = await handleConciergeButton({
    customId,
    guild,
    reply: async (payload) => { replies.push(payload); }
  });
  return { replies, result };
}

async function withRoadmapFailure(callback) {
  const runtimeId = require.resolve('../../../src/systems/communityConcierge');
  const featureId = require.resolve('../../../src/composition/communityRoadmapFeature');
  const previousRuntime = require.cache[runtimeId];
  const previousFeature = require.cache[featureId];
  const sentinel = new Error('roadmap sentinel');
  let calls = 0;

  delete require.cache[runtimeId];
  require.cache[featureId] = {
    id: featureId,
    filename: featureId,
    loaded: true,
    exports: {
      createCommunityRoadmapFeature: () => {
        calls += 1;
        throw sentinel;
      }
    }
  };

  try {
    await callback({ runtime: require('../../../src/systems/communityConcierge'), sentinel, calls: () => calls });
  } finally {
    delete require.cache[runtimeId];
    if (previousRuntime) require.cache[runtimeId] = previousRuntime;
    if (previousFeature) require.cache[featureId] = previousFeature;
    else delete require.cache[featureId];
  }
}

void (async () => {
  const night = await invoke('concierge_night');
  const expectedNight = buildCommunityNonRoleConciergePresentationPayload({
    action: 'night',
    links: ['<#night>', '<#voice>']
  });
  assert.equal(night.replies.length, 1);
  assert.deepEqual(normalizePayload(night.replies[0]), normalizePayload(expectedNight));
  assert.equal(night.result, true);

  const emptyNight = await invoke('concierge_night', { channels: { cache: new Collection() } });
  assert.equal(normalizePayload(emptyNight.replies[0]).embeds[0].fields[0].value, '目前還沒有找到深夜入口。');

  const bot = await invoke('concierge_bot');
  assert.equal(bot.replies.length, 1);
  assert.deepEqual(
    normalizePayload(bot.replies[0]),
    normalizePayload(buildCommunityNonRoleConciergePresentationPayload({ action: 'bot' }))
  );
  assert.equal(bot.result, true);

  const roadmap = await invoke('concierge_roadmap');
  assert.equal(roadmap.replies.length, 1);
  assert.deepEqual(
    normalizePayload(roadmap.replies[0]),
    normalizePayload(buildCommunityNonRoleConciergePresentationPayload({ action: 'roadmap', buildRoadmapEmbed }))
  );
  assert.equal(roadmap.result, true);

  await withRoadmapFailure(async ({ runtime, sentinel, calls }) => {
    const replies = [];
    await assert.rejects(
      () => runtime.handleConciergeButton({
        customId: 'concierge_roadmap',
        guild: createGuild(),
        reply: async (payload) => { replies.push(payload); }
      }),
      (error) => error === sentinel
    );
    assert.equal(calls(), 1);
    assert.equal(replies.length, 0);
  });

  const unknown = await invoke('concierge_unknown');
  assert.equal(unknown.replies.length, 0);
  assert.equal(unknown.result, false);
  console.log('Production non-role Concierge presentation redirect preserves payloads, replies, errors, and unknown behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
