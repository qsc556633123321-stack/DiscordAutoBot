function createFakeCommunityRoadmapGateway({ roadmap, error = null } = {}) {
  const calls = [];
  return {
    calls,
    getCommunityRoadmap() {
      calls.push([]);
      if (error) throw error;
      return roadmap;
    }
  };
}

function createFakeLogger() {
  const entries = [];
  return {
    entries,
    error: (...args) => entries.push(['error', args])
  };
}

module.exports = { createFakeCommunityRoadmapGateway, createFakeLogger };
