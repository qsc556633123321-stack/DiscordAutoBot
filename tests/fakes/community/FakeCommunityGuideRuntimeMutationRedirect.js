async function runMutationCandidate({ mutationPort, operation, payload, message } = {}) {
  return operation === 'edit' ? mutationPort.edit({ messageId: message.id, payload }) : mutationPort.send({ payload });
}
module.exports = { runMutationCandidate };
