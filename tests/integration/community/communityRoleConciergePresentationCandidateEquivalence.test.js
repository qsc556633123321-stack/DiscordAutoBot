const assert = require('node:assert/strict');
const { Collection, ChannelType } = require('discord.js');
const {
  buildCommunityRoleConciergePresentationPayload
} = require('../../fakes/community/FakeCommunityRoleConciergePresentation');

const runtimeId = require.resolve('../../../src/systems/communityConcierge');
const featureId = require.resolve('../../../src/composition/communityRoleQuickActionFeature');

function normalizePayload(payload) {
  return {
    embeds: payload.embeds.map((embed) => embed.toJSON()),
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
    id: 'guild-1',
    channels: {
      cache: new Collection([
        ['games', channel('games', '組隊招募')],
        ['invest', channel('invest', '股票投資')],
        ['dev', channel('dev', 'AI 開發')]
      ])
    }
  };
}

async function invokeRuntime({ customId, added }) {
  const featureCache = require.cache[featureId];
  const runtimeCache = require.cache[runtimeId];
  const requests = [];
  const replies = [];
  delete require.cache[runtimeId];
  require.cache[featureId] = {
    id: featureId,
    filename: featureId,
    loaded: true,
    exports: {
      createCommunityRoleQuickActionFeature: () => ({
        communityRoleQuickAction: {
          execute: async (request) => {
            requests.push(request);
            return { added, action: request.action, roleName: 'ignored by presentation' };
          }
        }
      })
    }
  };

  try {
    const { handleConciergeButton } = require('../../../src/systems/communityConcierge');
    const result = await handleConciergeButton({
      customId,
      guild: createGuild(),
      member: { id: 'member-1' },
      reply: async (payload) => { replies.push(payload); }
    });
    return { result, requests, payload: replies[0] };
  } finally {
    delete require.cache[runtimeId];
    if (runtimeCache) require.cache[runtimeId] = runtimeCache;
    if (featureCache) require.cache[featureId] = featureCache;
    else delete require.cache[featureId];
  }
}

void (async () => {
  const cases = [
    ['games', 'concierge_games', ['<#games>']],
    ['invest', 'concierge_invest', ['<#invest>']],
    ['dev', 'concierge_dev', ['<#dev>']]
  ];

  for (const [action, customId, links] of cases) {
    for (const added of [true, false]) {
      const runtime = await invokeRuntime({ customId, added });
      const candidate = buildCommunityRoleConciergePresentationPayload({ action, added, links });
      assert.equal(runtime.result, true);
      assert.deepEqual(runtime.requests, [{ guildId: 'guild-1', memberId: 'member-1', action }]);
      assert.deepEqual(normalizePayload(runtime.payload), normalizePayload(candidate));
    }
  }

  const emptyGames = buildCommunityRoleConciergePresentationPayload({ action: 'games', added: false, links: [] });
  assert.match(emptyGames.embeds[0].data.fields[1].value, /目前還沒有找到遊戲入口頻道/);
  const sentinel = new Error('presentation sentinel');
  assert.throws(
    () => buildCommunityRoleConciergePresentationPayload({ action: 'games', added: true, links: { join: () => { throw sentinel; } } }),
    (error) => error === sentinel
  );
  assert.equal(buildCommunityRoleConciergePresentationPayload({ action: 'unknown', added: true }), null);
  console.log('Role Concierge presentation candidate preserves Games, Invest, and Dev runtime payloads and error pass-through.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
