function createFakeRoadmapPublicationPersistencePort({ save = () => ({ persisted: true }) } = {}) {
  const calls = [];
  return {
    calls,
    savePublicationState(request) {
      calls.push(request);
      return save(request);
    }
  };
}

module.exports = { createFakeRoadmapPublicationPersistencePort };
