const assert = require('node:assert/strict');
const { Collection, ChannelType } = require('discord.js');
const runtimeId = require.resolve('../../../src/systems/communityConcierge');
const featureId = require.resolve('../../../src/composition/communityRoleQuickActionFeature');

function normalize(payload) {
  return { embeds: payload.embeds.map((embed) => embed.toJSON()), ephemeral: payload.ephemeral };
}

function createGuild() {
  const channel = (id, name) => ({ id, name, type: ChannelType.GuildText, toString: () => `<#${id}>` });
  return { id: 'guild-1', channels: { cache: new Collection([
    ['games', channel('games', '組隊招募')],
    ['invest', channel('invest', '股票投資')],
    ['dev', channel('dev', 'AI 開發')]
  ]) } };
}

async function invoke({ customId, added }) {
  const featureCache = require.cache[featureId];
  const runtimeCache = require.cache[runtimeId];
  const calls = [];
  const replies = [];
  delete require.cache[runtimeId];
  require.cache[featureId] = {
    id: featureId, filename: featureId, loaded: true,
    exports: { createCommunityRoleQuickActionFeature: () => ({ communityRoleQuickAction: {
      execute: async (request) => { calls.push(request); return { added, action: request.action, roleName: 'ignored' }; }
    } }) }
  };
  try {
    const { handleConciergeButton } = require('../../../src/systems/communityConcierge');
    const result = await handleConciergeButton({
      customId, guild: createGuild(), member: { id: 'member-1' }, reply: async (payload) => replies.push(payload)
    });
    return { result, calls, payload: replies[0], replyCount: replies.length };
  } finally {
    delete require.cache[runtimeId];
    if (runtimeCache) require.cache[runtimeId] = runtimeCache;
    if (featureCache) require.cache[featureId] = featureCache;
    else delete require.cache[featureId];
  }
}

void (async () => {
  for (const [action, customId] of [['games', 'concierge_games'], ['invest', 'concierge_invest'], ['dev', 'concierge_dev']]) {
    for (const added of [true, false]) {
      const actual = await invoke({ customId, added });
      assert.equal(actual.result, true);
      assert.equal(actual.replyCount, 1);
      assert.deepEqual(actual.calls, [{ guildId: 'guild-1', memberId: 'member-1', action }]);
      assert.equal(actual.payload.ephemeral, true);
    }
  }
  const rejectedMutationCompatibility = await invoke({ customId: 'concierge_games', added: true });
  assert.match(JSON.stringify(normalize(rejectedMutationCompatibility.payload)), /已幫你加入/);
  const unknown = await invoke({ customId: 'concierge_unknown', added: false });
  assert.equal(unknown.result, false);
  assert.equal(unknown.replyCount, 0);
  console.log('Production role Concierge presentation redirect preserves workflow, reply, return, and rejection-compatible payload behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
