const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, Collection } = require('discord.js');
const contract = require('../fixtures/communityGuideMutationContract.json');
const concierge = require('../../src/systems/communityConcierge');

const onboardingPath = path.resolve(__dirname, '..', '..', 'src', 'data', 'onboarding-flows.json');

function makeMessage(id, events, behavior = {}) {
  return {
    id,
    async edit(payload) {
      events.edit += 1;
      events.lastEditPayload = payload;
      if (behavior.editFails) throw new Error('frozen edit failure');
      return this;
    }
  };
}

function makeTextChannel({ id, name, events, behavior = {}, parentId = 'other-parent' }) {
  return {
    id,
    name,
    type: ChannelType.GuildText,
    parentId,
    messages: {
      async fetch() {
        events.fetch += 1;
        if (behavior.fetchFails) throw new Error('frozen fetch failure');
        return behavior.existingMessage || null;
      }
    },
    permissionOverwrites: {
      async set() {
        events.overwriteAttempts += 1;
        if (behavior.overwriteFails) throw new Error('frozen overwrite failure');
      }
    },
    async setParent(parent) {
      events.moves += 1;
      this.parentId = parent;
      return this;
    },
    async send(payload) {
      events.send += 1;
      events.lastSendPayload = payload;
      if (behavior.sendFails) throw new Error('frozen send failure');
      return makeMessage(behavior.sentMessageId || `${id}-sent`, events);
    }
  };
}

function makeGuild({ existingGuide, existingRoadmap, guideBehavior, roadmapBehavior, events }) {
  const cache = new Collection();
  if (existingGuide) cache.set(existingGuide.id, existingGuide);
  if (existingRoadmap) cache.set(existingRoadmap.id, existingRoadmap);
  let nextId = 1;
  const guild = {
    id: 'guild-1',
    name: 'Frozen Guild',
    roles: { everyone: { id: 'everyone' }, cache: new Collection() },
    members: { me: { id: 'bot' } },
    channels: {
      cache,
      async create(options) {
        events.created.push({ type: options.type, name: options.name });
        const id = `created-${nextId++}`;
        if (options.type === ChannelType.GuildCategory) {
          const category = { id, name: options.name, type: ChannelType.GuildCategory };
          cache.set(id, category);
          return category;
        }
        const behavior = options.name === concierge.ROADMAP_CHANNEL_NAME ? roadmapBehavior : guideBehavior;
        const channel = makeTextChannel({ id, name: options.name, events, behavior, parentId: options.parent });
        cache.set(id, channel);
        return channel;
      }
    }
  };
  return guild;
}

async function withOnboardingState(initialState, behavior, run) {
  const originalExists = fs.existsSync;
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const events = { fetch: 0, edit: 0, send: 0, moves: 0, overwriteAttempts: 0, writeAttempts: 0, created: [], errors: [] };
  let stored = initialState;
  const originalConsoleError = console.error;
  fs.existsSync = (file) => path.resolve(file) === onboardingPath || originalExists(file);
  fs.readFileSync = (file, ...rest) => path.resolve(file) === onboardingPath
    ? JSON.stringify(stored)
    : originalRead(file, ...rest);
  fs.writeFileSync = (file, content, ...rest) => {
    if (path.resolve(file) !== onboardingPath) return originalWrite(file, content, ...rest);
    events.writeAttempts += 1;
    if (behavior.writeFails) throw new Error('frozen write failure');
    stored = JSON.parse(content);
  };
  console.error = (...args) => events.errors.push(args.map(String).join(' '));
  try {
    return await run(events, () => stored);
  } finally {
    fs.existsSync = originalExists;
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    console.error = originalConsoleError;
  }
}

async function assertGuideScenario(name, setup) {
  const expected = contract[name];
  await withOnboardingState(setup.state, setup.behavior || {}, async (events, getStored) => {
    const guideMessage = setup.guideMessage && makeMessage('guide-tracked', events, setup.guideBehavior);
    const guide = makeTextChannel({
      id: 'guide-channel',
      name: concierge.GUIDE_CHANNEL_NAME,
      events,
      behavior: { ...setup.guideBehavior, existingMessage: guideMessage }
    });
    const guild = makeGuild({ existingGuide: setup.existingGuide === false ? null : guide, guideBehavior: setup.guideBehavior, events });
    if (expected.rejects) {
      await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'refresh' }));
    } else {
      const result = await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
      assert.equal(Boolean(result.channel), true);
    }
    for (const key of ['fetch', 'edit', 'send', 'writeAttempts']) {
      if (expected[key] !== undefined) assert.equal(events[key], expected[key], `${name}: ${key}`);
    }
    if (!expected.rejects && !setup.behavior?.writeFails) {
      assert.equal(getStored()['guild-1'].guideChannelId, 'guide-channel');
    }
  });
}

async function main() {
  await assertGuideScenario('existingTrackedGuideMessage', {
    state: { 'guild-1': { guideMessageId: 'guide-tracked' } }, guideMessage: true, guideBehavior: {}
  });
  await assertGuideScenario('missingTrackedGuideMessage', {
    state: { 'guild-1': { guideMessageId: 'missing-message' } }, guideBehavior: {}
  });
  await assertGuideScenario('missingGuideMessageId', { state: { 'guild-1': {} }, guideBehavior: {} });
  await withOnboardingState({ 'guild-1': {} }, {}, async (events, getStored) => {
    const guild = makeGuild({ existingGuide: null, guideBehavior: {}, events });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(Boolean(result.channel), true);
    assert.equal(
      events.created.filter((entry) => entry.type === ChannelType.GuildText).length,
      contract.missingGuideChannel.createdTextChannels
    );
    assert.equal(events.send, contract.missingGuideChannel.send);
    assert.equal(events.writeAttempts, contract.missingGuideChannel.writeAttempts);
    assert.equal(getStored()['guild-1'].guideChannelId, result.channel.id);
  });
  await assertGuideScenario('messageEditFailure', {
    state: { 'guild-1': { guideMessageId: 'guide-tracked' } }, guideMessage: true, guideBehavior: { editFails: true }
  });
  await assertGuideScenario('messageSendFailure', {
    state: { 'guild-1': {} }, guideBehavior: { sendFails: true }
  });
  await assertGuideScenario('jsonWriteFailure', {
    state: { 'guild-1': {} }, behavior: { writeFails: true }, guideBehavior: {}
  });
  await withOnboardingState({ 'guild-1': {} }, { writeFails: true }, async (events, getStored) => {
    const guide = makeTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, events, behavior: {} });
    const guild = makeGuild({ existingGuide: guide, guideBehavior: {}, events });
    await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.equal(events.send, 1, 'Discord publication remains successful when JSON persistence fails');
    assert.equal(getStored()['guild-1'].guideMessageId, undefined, 'failed persistence leaves the message untracked');
    assert.equal(events.errors.some((line) => line.includes('Write onboarding-flows.json failed')), true);
  });

  await withOnboardingState({ 'guild-1': {} }, {}, async (events) => {
    const guide = makeTextChannel({
      id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, events, behavior: { overwriteFails: true }
    });
    const guild = makeGuild({ existingGuide: guide, guideBehavior: {}, events });
    await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.equal(events.overwriteAttempts, contract.permissionOverwriteFailure.overwriteAttempts);
  });

  for (const [name, roadmapMessage] of [
    ['roadmapExistingMessage', true],
    ['roadmapMissingMessage', false]
  ]) {
    const expected = contract[name];
    await withOnboardingState({ 'guild-1': { roadmapMessageId: 'roadmap-tracked' } }, {}, async (events, getStored) => {
      const roadmap = makeTextChannel({
        id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, events,
        behavior: { existingMessage: roadmapMessage ? makeMessage('roadmap-tracked', events) : null }
      });
      const guild = makeGuild({ existingRoadmap: roadmap, roadmapBehavior: {}, events });
      await concierge.setupRoadmapPanel(guild);
      for (const key of ['fetch', 'edit', 'send', 'writeAttempts']) {
        assert.equal(events[key], expected[key], `${name}: ${key}`);
      }
      assert.equal(getStored()['guild-1'].roadmapChannelId, 'roadmap-channel');
    });
  }

  const setupSource = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'legacy', 'commands', 'setup-community-guide.js'), 'utf8');
  const refreshSource = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'legacy', 'commands', 'refresh-community-guide.js'), 'utf8');
  assert.match(setupSource, /setName\('setup-community-guide'\)/);
  assert.match(refreshSource, /setName\('refresh-community-guide'\)/);
  assert.match(setupSource, /deferReply\(\{ ephemeral: true \}\)/);
  assert.match(refreshSource, /deferReply\(\{ ephemeral: true \}\)/);
  assert.match(setupSource, /setupCommunityGuide\(interaction\.guild, \{ mode: 'create' \}\)/);
  assert.match(refreshSource, /setupCommunityGuide\(interaction\.guild, \{ mode: 'refresh' \}\)/);
  const bootstrapSource = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'legacy', 'community', 'communityBootstrapSystem.js'), 'utf8');
  const v3Source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'legacy', 'systemRuntimes', 'communityV3BuilderRuntime.js'), 'utf8');
  assert.match(bootstrapSource, /setupCommunityGuide/);
  assert.match(v3Source, /setupCommunityGuide/);
  console.log('Community Guide mutation characterization baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
