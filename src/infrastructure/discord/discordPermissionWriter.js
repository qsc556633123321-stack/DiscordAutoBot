const { fail, ok } = require('../../core/result');
const { withRetry } = require('./discordChannelRepository');

async function apply(target, overwrites, reason = 'Community OS permission sync') {
  try {
    await withRetry(() => target.permissionOverwrites.set(overwrites, reason));
    return ok({ targetId: target.id });
  } catch (error) {
    return fail('PERMISSION_SYNC_FAILED', error.message, { targetId: target.id });
  }
}

module.exports = { apply };
