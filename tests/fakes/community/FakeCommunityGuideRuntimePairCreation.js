function assertFunction(value, name) {
  if (typeof value !== 'function') throw new TypeError(`FakeCommunityGuideRuntimePairCreation requires ${name}`);
}

function createFakeCommunityGuideRuntimePairCreation({ ensureChannel, createAdapterPair, legacyLookup, buildPlan, legacyEdit, legacySend, persist, roadmap } = {}) {
  for (const [name, value] of Object.entries({ ensureChannel, createAdapterPair, legacyLookup, buildPlan, legacyEdit, legacySend, persist, roadmap })) {
    assertFunction(value, name);
  }

  return async function run({ mode, guideMessageId, payload }) {
    const channel = await ensureChannel();
    createAdapterPair({ ensuredChannel: channel });
    const message = guideMessageId && mode !== 'force' ? await legacyLookup(channel, guideMessageId) : null;
    const plan = buildPlan({ mode, guideMessageId, existingMessageAvailable: Boolean(message) });
    const published = plan === 'edit' ? await legacyEdit(message, payload) : await legacySend(channel, payload);
    await persist({ channelId: channel.id, messageId: published.id });
    await roadmap();
    return { channel, message: published };
  };
}

module.exports = { createFakeCommunityGuideRuntimePairCreation };
