const DELETE_PREFIXES = ['delete-pending', 'test-', 'old-', 'temp-'];

function runDeleteCandidateRule(channel) {
  const name = channel?.name || '';
  if (!DELETE_PREFIXES.some((prefix) => name.startsWith(prefix))) return null;
  return {
    action: 'delete_candidate',
    confidence: 85,
    risk: name.startsWith('delete-pending') ? 'medium' : 'high',
    targetName: name,
    reason: 'matches delete candidate naming policy'
  };
}

module.exports = { runDeleteCandidateRule };
