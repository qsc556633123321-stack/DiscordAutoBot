const NORMALIZE_RENAMES = new Map([
  ['ai工具', 'AI工具'],
  ['股票ai工具', '股票AI工具'],
  ['閒聊討論', '認真討論']
]);

function runRenameNormalizeRule(channel) {
  const name = channel?.name || '';
  const normalized = NORMALIZE_RENAMES.get(name);
  if (!normalized) return null;
  return {
    action: 'rename',
    confidence: 95,
    risk: 'low',
    targetName: name,
    newName: normalized,
    renamePriority: 'casing normalize',
    reason: 'matches approved rename normalization rule'
  };
}

module.exports = { runRenameNormalizeRule };
