const { fail, ok } = require('../../core/result');
const { writeServerLog } = require('../../systems/serverLogs');

async function audit(guild, payload) {
  try {
    await writeServerLog(guild, payload);
    return ok();
  } catch (error) {
    return fail('AUDIT_LOG_FAILED', error.message);
  }
}

module.exports = { audit };
