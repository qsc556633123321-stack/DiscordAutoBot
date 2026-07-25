const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, Collection } = require('discord.js');

const onboardingPath = path.resolve(__dirname, '..', '..', 'src', 'data', 'onboarding-flows.json');

function createEventLog() {
  return {
    calls: [],
    errors: [],
    created: [],
    writes: 0,
    state: { onboarding: {} }
  };
}

function createMessage(id, log, behavior = {}, label = 'guide') {
  return {
    id,
    async edit(payload) {
      log.calls.push(`${label}.message.edit`);
      log.lastEditPayload = payload;
      if (behavior.editFails) throw new Error(`${label} edit failure`);
      return this;
    }
  };
}

function createTextChannel({ id, name, parentId, log, behavior = {}, label }) {
  return {
    id,
    name,
    type: ChannelType.GuildText,
    parentId,
    messages: {
      async fetch() {
        log.calls.push(`${label}.message.fetch`);
        if (behavior.fetchFails) throw new Error(`${label} fetch failure`);
        return behavior.existingMessage || null;
      }
    },
    permissionOverwrites: {
      async set(overwrites, reason) {
        log.calls.push(`${label}.overwrite.set`);
        log.overwrite = { overwrites, reason };
        if (behavior.overwriteFails) throw new Error(`${label} overwrite failure`);
      },
      async edit() {
        log.calls.push(`${label}.overwrite.edit`);
      }
    },
    async setParent(nextParent, options) {
      log.calls.push(`${label}.channel.setParent`);
      log.parentMove = { nextParent, options };
      if (behavior.parentFails) throw new Error(`${label} parent failure`);
      this.parentId = nextParent;
      return this;
    },
    async setPosition(position, options) {
      log.calls.push(`${label}.channel.setPosition`);
      log.position = { position, options };
      if (behavior.positionFails) throw new Error(`${label} position failure`);
      return this;
    },
    async send(payload) {
      log.calls.push(`${label}.message.send`);
      log.lastSendPayload = payload;
      if (behavior.sendFails) throw new Error(`${label} send failure`);
      return createMessage(behavior.sentMessageId || `${id}-sent`, log, behavior, label);
    }
  };
}

function createGuild({ guideName, roadmapName, log, behavior = {}, existingGuide, existingRoadmap }) {
  const cache = new Collection();
  if (existingGuide) cache.set(existingGuide.id, existingGuide);
  if (existingRoadmap) cache.set(existingRoadmap.id, existingRoadmap);
  let sequence = 0;
  let findCount = 0;
  const nativeFind = cache.find.bind(cache);
  const existingCategory = { id: 'category-existing', name: 'test-existing-category', type: ChannelType.GuildCategory };
  cache.find = (predicate) => {
    findCount += 1;
    if (behavior.categoryExists && findCount === 1) return existingCategory;
    return nativeFind(predicate);
  };

  return {
    id: 'guild-1',
    name: 'Frozen Guide Guild',
    roles: { everyone: { id: 'everyone' }, cache: new Collection() },
    members: { me: { id: 'bot' } },
    channels: {
      cache,
      async create(options) {
        sequence += 1;
        if (options.type === ChannelType.GuildCategory) {
          log.calls.push('category.create');
          if (behavior.categoryCreateFails) throw new Error('category create failure');
          const category = { id: `category-${sequence}`, name: options.name, type: ChannelType.GuildCategory };
          cache.set(category.id, category);
          log.created.push({ type: 'category', options });
          return category;
        }
        const label = options.name === roadmapName ? 'roadmap' : 'guide';
        log.calls.push(`${label}.channel.create`);
        if (behavior[`${label}ChannelCreateFails`]) throw new Error(`${label} channel create failure`);
        const channel = createTextChannel({
          id: `${label}-channel-${sequence}`,
          name: options.name,
          parentId: options.parent,
          log,
          label,
          behavior: behavior[label] || {}
        });
        cache.set(channel.id, channel);
        log.created.push({ type: 'text', options });
        return channel;
      }
    }
  };
}

async function withOnboardingFile({ initial = {}, raw, writeFails = false, writeFailAt, missingFile = false }, run) {
  const original = {
    existsSync: fs.existsSync,
    readFileSync: fs.readFileSync,
    writeFileSync: fs.writeFileSync,
    consoleError: console.error
  };
  const log = createEventLog();
  let state = initial;
  let exists = !missingFile;
  fs.existsSync = (file) => path.resolve(file) === onboardingPath ? exists : original.existsSync(file);
  fs.readFileSync = (file, ...args) => {
    if (path.resolve(file) !== onboardingPath) return original.readFileSync(file, ...args);
    log.calls.push('onboarding.read');
    return raw === undefined ? JSON.stringify(state) : raw;
  };
  fs.writeFileSync = (file, content, ...args) => {
    if (path.resolve(file) !== onboardingPath) return original.writeFileSync(file, content, ...args);
    log.calls.push('onboarding.write');
    log.writes += 1;
    if (writeFails || (writeFailAt && log.writes === writeFailAt)) throw new Error('onboarding write failure');
    exists = true;
    state = JSON.parse(content);
    log.state.onboarding = state;
  };
  console.error = (...args) => log.errors.push(args.map(String).join(' '));
  try {
    return await run({ log, getState: () => state });
  } finally {
    fs.existsSync = original.existsSync;
    fs.readFileSync = original.readFileSync;
    fs.writeFileSync = original.writeFileSync;
    console.error = original.consoleError;
  }
}

module.exports = {
  createGuild,
  createMessage,
  createTextChannel,
  withOnboardingFile
};
