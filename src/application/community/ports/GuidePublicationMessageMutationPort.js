function assertGuidePublicationMessageMutationPort(port) {
  if (!port || typeof port.edit !== 'function' || typeof port.send !== 'function') {
    throw new Error('GuidePublicationMessageMutationPort requires edit and send methods');
  }
}

module.exports = { assertGuidePublicationMessageMutationPort };
