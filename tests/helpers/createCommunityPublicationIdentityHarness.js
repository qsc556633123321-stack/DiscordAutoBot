function createCommunityPublicationIdentityHarness({ channels = [], records = {}, fetchError } = {}) {
  const log = { calls: [], selected: null, sent: 0, edited: 0 };
  const byName = (name) => channels.find((channel) => channel.name === name) || null;
  const resolve = ({ kind, name, messageField }) => {
    const channel = byName(name);
    const id = records[messageField];
    log.calls.push(`${kind}.channel.name`);
    if (!channel || !id) return { channel, message: null, action: 'send' };
    log.calls.push(`${kind}.message.fetch:${id}`);
    if (fetchError) return { channel, message: null, action: 'send' };
    const message = channel.messages?.[id] || null;
    log.selected = message;
    return { channel, message, action: message ? 'edit' : 'send' };
  };
  return { resolve, log };
}
module.exports = { createCommunityPublicationIdentityHarness };
