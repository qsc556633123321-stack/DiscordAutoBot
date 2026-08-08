function assertGuidePublicationMessageLookupPort(port) {
  if (!port || typeof port.lookup !== 'function') {
    throw new Error('GuidePublicationMessageLookupPort requires a lookup method');
  }
}

module.exports = { assertGuidePublicationMessageLookupPort };
