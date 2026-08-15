const assert = require('node:assert/strict');
const { Collection, ChannelType } = require('discord.js');
const {
  buildCommunityNonRoleConciergePresentationPayload
} = require('../../fakes/community/FakeCommunityNonRoleConciergePresentationCandidate');
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

async function invokeRuntime(customId, guild = createGuild()) {
  const replies = [];
  const result = await handleConciergeButton({
    customId,
    guild,
    reply: async (payload) => { replies.push(payload); }
  });
  assert.equal(replies.length, 1);
  return { payload: replies[0], result };
}

void (async () => {
  const night = await invokeRuntime('concierge_night');
  const nightCandidate = buildCommunityNonRoleConciergePresentationPayload({
    action: 'night',
    links: ['<#night>', '<#voice>']
  });
  assert.deepEqual(normalizePayload(night.payload), normalizePayload(nightCandidate));
  assert.equal(night.result, true);

  const bot = await invokeRuntime('concierge_bot');
  const botCandidate = buildCommunityNonRoleConciergePresentationPayload({ action: 'bot' });
  assert.deepEqual(normalizePayload(bot.payload), normalizePayload(botCandidate));
  assert.equal(bot.result, true);

  const roadmap = await invokeRuntime('concierge_roadmap');
  const roadmapCandidate = buildCommunityNonRoleConciergePresentationPayload({
    action: 'roadmap',
    buildRoadmapEmbed
  });
  assert.deepEqual(normalizePayload(roadmap.payload), normalizePayload(roadmapCandidate));
  assert.equal(roadmap.result, true);

  const sentinel = new Error('presentation sentinel');
  assert.throws(
    () => buildCommunityNonRoleConciergePresentationPayload({
      action: 'roadmap',
      buildRoadmapEmbed: () => { throw sentinel; }
    }),
    (error) => error === sentinel
  );
  assert.equal(buildCommunityNonRoleConciergePresentationPayload({ action: 'unknown' }), null);
  console.log('Non-role Concierge presentation candidate preserves Night, Bot, Roadmap payloads and error pass-through.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
