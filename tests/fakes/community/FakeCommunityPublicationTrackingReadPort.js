const SUPPORTED_PUBLICATIONS = Object.freeze(['guide', 'roadmap']);

function assertPublication(publication) {
  if (!SUPPORTED_PUBLICATIONS.includes(publication)) {
    throw new Error(`Unsupported publication: ${publication}`);
  }
}

function createFakeCommunityPublicationTrackingReadPort({ adapter } = {}) {
  if (!adapter || typeof adapter.readTrackedMessage !== 'function') {
    throw new TypeError('CommunityPublicationTrackingReadPort requires readTrackedMessage');
  }

  return {
    readTrackedMessage({ guildId, publication } = {}) {
      assertPublication(publication);
      return adapter.readTrackedMessage({ guildId, publication });
    }
  };
}

module.exports = { SUPPORTED_PUBLICATIONS, createFakeCommunityPublicationTrackingReadPort };
