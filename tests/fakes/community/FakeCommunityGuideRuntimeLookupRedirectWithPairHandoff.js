async function runLookupRedirectCandidate({ pair, force = false, guideMessageId } = {}) {
  let message = null;
  let lookupCalls = 0;
  if (!force && guideMessageId) {
    lookupCalls += 1;
    const result = await pair.lookupPort.lookup({ messageId: guideMessageId });
    if (result.status === 'MessageAvailable') message = pair.getRetainedMessage();
  }
  return { message, lookupCalls, branch: message ? 'edit' : 'send' };
}
module.exports = { runLookupRedirectCandidate };
