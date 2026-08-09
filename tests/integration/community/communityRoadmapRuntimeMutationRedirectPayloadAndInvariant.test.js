const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

function createPayloadIdentityPair(channel, metrics) {
  let retained = null;
  return {
    lookupPort: {
      async lookupTrackedMessage({ messageId }) {
        metrics.lookupCalls += 1;
        retained = await channel.messages.fetch(messageId);
        return retained ? { kind: 'Available', messageId } : { kind: 'Unavailable' };
      }
    },
    mutationPort: {
      async edit({ messageId, payload }) {
        assert.strictEqual(messageId, retained.id);
        metrics.editPayload = payload;
        await retained.edit(payload);
        return { kind: 'EditSuccess', messageId };
      },
      async send({ payload }) {
        metrics.sendPayload = payload;
        retained = await channel.send(payload);
        return { kind: 'SendSuccess', messageId: retained.id };
      }
    },
    getRetainedMessage() { metrics.getterCalls += 1; return retained; }
  };
}

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createPayloadIdentityPair }, async ({ concierge, guild, roadmap, log, metrics }) => {
    const message = { id: 'M', async edit(payload) { log.receivedPayload = payload; return { id: 'E' }; } };
    roadmap.messages.fetch = async () => message;
    await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(log.receivedPayload, metrics.editPayload);
  });

  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, createPair: createPayloadIdentityPair }, async ({ concierge, guild, roadmap, log, metrics }) => {
    roadmap.send = async (payload) => {
      log.receivedPayload = payload;
      return { id: 'S' };
    };
    await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(log.receivedPayload, metrics.sendPayload);
  });

  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, createPair() {
    return {
      lookupPort: { async lookupTrackedMessage() { return { kind: 'Unavailable' }; } },
      mutationPort: { async send() { return { kind: 'SendSuccess', messageId: 'S' }; } },
      getRetainedMessage() { return null; }
    };
  } }, async ({ concierge, guild, log }) => {
    await assert.rejects(concierge.setupRoadmapPanel(guild), /retained-message invariant/);
    assert.equal(log.writes, 0);
  });

  console.log('Roadmap runtime preserves Pair payload flow and Send retained-message invariant');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
