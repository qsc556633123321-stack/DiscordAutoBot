const fs = require('node:fs');

const ONBOARDING_SUFFIX = 'onboarding-flows.json';

function createCollection(items = []) {
  const collection = new Map(items.map((item) => [item.id, item]));
  collection.find = (predicate) => Array.from(collection.values()).find(predicate);
  return collection;
}

function createChannel(id, extras = {}) {
  return { id, name: extras.name || id, type: extras.type || 0, ...extras };
}

async function withChannelLookupHarness(options, callback) {
  const metrics = {
    onboardingReads: 0,
    onboardingWrites: 0,
    cacheGets: [],
    cacheFinds: 0,
    fetches: [],
    memberSends: [],
    channelCreates: 0,
    channelSends: 0,
    logs: []
  };
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalError = console.error;
  const channels = createCollection(options.cachedChannels || []);
  const originalGet = channels.get.bind(channels);
  channels.get = (id) => {
    metrics.cacheGets.push(id);
    return originalGet(id);
  };
  const originalFind = channels.find.bind(channels);
  channels.find = (predicate) => {
    metrics.cacheFinds += 1;
    return originalFind(predicate);
  };
  const guild = {
    id: options.guildId || 'guild-1',
    name: 'Characterization Guild',
    channels: {
      cache: channels,
      fetch: async (id) => {
        metrics.fetches.push(id);
        if (options.fetchError) throw options.fetchError;
        return options.fetchResult === undefined ? null : options.fetchResult;
      },
      create: async () => {
        metrics.channelCreates += 1;
        return null;
      }
    }
  };
  const member = {
    guild,
    send: async (payload) => {
      metrics.memberSends.push(payload);
      if (options.sendError) throw options.sendError;
      return { id: 'dm-message' };
    }
  };

  fs.readFileSync = (filePath, ...args) => {
    if (String(filePath).endsWith(ONBOARDING_SUFFIX)) {
      metrics.onboardingReads += 1;
      if (options.readError) throw options.readError;
      return JSON.stringify(options.root || {});
    }
    return originalRead(filePath, ...args);
  };
  fs.writeFileSync = (filePath, data, ...args) => {
    if (String(filePath).endsWith(ONBOARDING_SUFFIX)) {
      metrics.onboardingWrites += 1;
      return undefined;
    }
    return originalWrite(filePath, data, ...args);
  };
  console.error = (...args) => metrics.logs.push(args.map(String).join(' '));

  try {
    const concierge = require('../../src/systems/communityConcierge');
    return await callback({ concierge, member, guild, metrics, createChannel });
  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    console.error = originalError;
  }
}

module.exports = { createChannel, withChannelLookupHarness };
