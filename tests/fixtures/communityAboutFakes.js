function createFakeCommunityAboutGateway({ facts = { guildName: 'Test Guild' }, error = null } = {}) {
  const calls = [];
  return {
    calls,
    getCommunityAboutFacts(input) {
      calls.push(input);
      if (error) throw error;
      return facts;
    }
  };
}

function createFakeLogger() {
  const entries = [];
  return {
    entries,
    info: (...args) => entries.push(['info', args]),
    warn: (...args) => entries.push(['warn', args]),
    error: (...args) => entries.push(['error', args])
  };
}

module.exports = { createFakeCommunityAboutGateway, createFakeLogger };
