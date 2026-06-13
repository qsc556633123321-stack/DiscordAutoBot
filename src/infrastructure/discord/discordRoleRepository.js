const { fail, ok } = require('../../core/result');

async function create(guild, options) {
  try {
    return ok(await guild.roles.create(options));
  } catch (error) {
    return fail('DISCORD_ROLE_WRITE_FAILED', error.message, { error });
  }
}

module.exports = { create };
