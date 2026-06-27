function isDuplicateLayoutAction(action) {
  return ['duplicate_channel', 'duplicate_game_category'].includes(action?.classification);
}

function collectDuplicateActions(plan) {
  return (plan?.actions || []).filter(isDuplicateLayoutAction);
}

module.exports = { collectDuplicateActions, isDuplicateLayoutAction };
