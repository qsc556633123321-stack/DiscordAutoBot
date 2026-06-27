const engine = require('./layoutDecisionEngine');

function classifyLayoutChannel(channel, expectedRecord = null) {
  return engine.classifyChannel(channel, expectedRecord);
}

function protectedReason(guild, channel, expectedRecord = null) {
  return engine.protectedReason(guild, channel, expectedRecord);
}

module.exports = { classifyLayoutChannel, protectedReason };
