function runOrphanChannelRule(channel) {
  if (!channel || channel.parentId) return null;
  return {
    action: 'delete_candidate',
    classification: 'orphan',
    confidence: 70,
    risk: 'medium',
    targetName: channel.name,
    reason: 'channel has no parent category'
  };
}

module.exports = { runOrphanChannelRule };
