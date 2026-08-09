async function redirectRoadmapMutation({ pair, message, payload, write }) {
  if (message) {
    await pair.mutationPort.edit({ messageId: message.id, payload });
    await write(message);
    return message;
  }
  const result = await pair.mutationPort.send({ payload });
  const retained = pair.getRetainedMessage();
  if (!retained || retained.id !== result.messageId) throw new Error('Roadmap redirect send retained-message invariant failed');
  await write(retained);
  return retained;
}
module.exports = { redirectRoadmapMutation };
