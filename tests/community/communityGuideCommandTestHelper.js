const crypto = require('node:crypto');
const { PermissionFlagsBits } = require('discord.js');

function loadCommandWithConcierge(commandRelativePath, stub) {
  const conciergePath = require.resolve('../../src/systems/communityConcierge');
  const commandPath = require.resolve(commandRelativePath);
  const originalExports = require(conciergePath);
  delete require.cache[commandPath];
  require.cache[conciergePath].exports = stub;
  const command = require(commandPath);
  return {
    command,
    restore() {
      delete require.cache[commandPath];
      require.cache[conciergePath].exports = originalExports;
    }
  };
}

function createInteraction({ authorized = true } = {}) {
  const calls = [];
  return {
    calls,
    guild: { id: 'guild-1', toString: () => '<#guild>' },
    memberPermissions: { has: (permission) => authorized && permission === PermissionFlagsBits.ManageChannels },
    async deferReply(payload) { calls.push({ name: 'deferReply', payload }); },
    async editReply(payload) { calls.push({ name: 'editReply', payload }); }
  };
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { createInteraction, hash, loadCommandWithConcierge };
