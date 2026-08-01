const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const conciergePath = path.join(root, 'src/systems/communityConcierge.js');
const applicationPath = path.join(root, 'src/application/community/index.js');

function createChannel(id, extras = {}) {
  return { id, name: extras.name || id, type: extras.type || 0, ...extras };
}

async function withWelcomeRuntimeHarness(options, callback) {
  const metrics = { reads: 0, writes: 0, cacheGets: [], cacheFinds: 0, fetches: [], sends: [], mapperCalls: [], builderCalls: [], logs: [] };
  const originalRead = fs.readFileSync;
  const originalWrite = fs.writeFileSync;
  const originalError = console.error;
  const applicationModule = require.resolve(applicationPath);
  const conciergeModule = require.resolve(conciergePath);
  const originalApplication = require(applicationModule);
  const cache = new Map((options.cachedChannels || []).map((channel) => [channel.id, channel]));
  cache.find = (predicate) => {
    metrics.cacheFinds += 1;
    if (options.cacheFindError) throw options.cacheFindError;
    return Array.from(cache.values()).find(predicate);
  };
  const originalGet = cache.get.bind(cache);
  cache.get = (id) => {
    metrics.cacheGets.push(id);
    if (options.cacheGetError) throw options.cacheGetError;
    return originalGet(id);
  };
  fs.readFileSync = (filePath, ...args) => {
    if (String(filePath).endsWith('onboarding-flows.json')) {
      metrics.reads += 1;
      if (options.readError) throw options.readError;
      return JSON.stringify(options.root);
    }
    return originalRead(filePath, ...args);
  };
  fs.writeFileSync = (filePath, data, ...args) => {
    if (String(filePath).endsWith('onboarding-flows.json')) { metrics.writes += 1; return undefined; }
    return originalWrite(filePath, data, ...args);
  };
  console.error = (...args) => metrics.logs.push(args.map(String).join(' '));
  require.cache[applicationModule].exports = {
    ...originalApplication,
    mapLegacyWelcomeDeliveryRequest(input) { metrics.mapperCalls.push(input); return originalApplication.mapLegacyWelcomeDeliveryRequest(input); },
    buildCommunityWelcomeMessage(request, context) { metrics.builderCalls.push({ request, context }); return originalApplication.buildCommunityWelcomeMessage(request, context); }
  };
  delete require.cache[conciergeModule];
  try {
    const concierge = require(conciergeModule);
    const guild = {
      id: options.guildId,
      name: options.guildName,
      channels: {
        cache,
        fetch: options.fetchMissing ? undefined : async (id) => {
          metrics.fetches.push(id);
          if (options.fetchError) throw options.fetchError;
          return options.fetchResult || null;
        }
      }
    };
    if (options.channelsMissing) delete guild.channels;
    const send = options.sendImplementation || ((payload) => {
      metrics.sends.push(payload);
      if (options.sendSyncError) throw options.sendSyncError;
      if (options.sendError) return Promise.reject(options.sendError);
      return Promise.resolve(options.sendValue);
    });
    const member = options.member || { guild, send: options.sendMissing ? undefined : send };
    return await callback({ concierge, member, metrics, guild });
  } finally {
    fs.readFileSync = originalRead;
    fs.writeFileSync = originalWrite;
    console.error = originalError;
    require.cache[applicationModule].exports = originalApplication;
    delete require.cache[conciergeModule];
  }
}

function legacyPayload({ guildId, guildName, guideChannelId }) {
  return { content: `歡迎加入 ${guildName}。如果你不知道從哪裡開始，可以先看這個互動導覽：https://discord.com/channels/${guildId}/${guideChannelId}\n也可以直接使用 /help-me-start。` };
}

module.exports = { createChannel, legacyPayload, withWelcomeRuntimeHarness };
