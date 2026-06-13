const { DEFAULT_QUEUE_DELAY_MS } = require('../../core/constants');
const { fail, ok } = require('../../core/result');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(operation, attempts = 2) {
  try {
    return await operation();
  } catch (error) {
    if (attempts <= 1 || !(error.status === 429 || /rate.?limit/i.test(error.message || ''))) throw error;
    await sleep(Math.max(Number(error.retryAfter || 1) * 1000, DEFAULT_QUEUE_DELAY_MS));
    return withRetry(operation, attempts - 1);
  }
}

async function execute(operation, label) {
  try {
    const data = await withRetry(operation);
    await sleep(DEFAULT_QUEUE_DELAY_MS);
    return ok(data, { operation: label });
  } catch (error) {
    return fail('DISCORD_CHANNEL_WRITE_FAILED', `${label}: ${error.message}`, { error });
  }
}

module.exports = {
  create: (guild, options) => execute(() => guild.channels.create(options), 'create channel'),
  move: (channel, parentId, options = {}) => execute(() => channel.setParent(parentId, options), 'move channel'),
  rename: (channel, name, reason) => execute(() => channel.setName(name, reason), 'rename channel'),
  reorder: (channel, position, options = {}) => execute(() => channel.setPosition(position, options), 'reorder channel'),
  withRetry
};
