function normalizeArchiveAction(action) {
  if (action?.type !== 'archive' && action?.action !== 'archive') return action;
  return {
    ...action,
    type: action.type === 'archive' ? 'delete_candidate' : action.type,
    action: action.action === 'archive' ? 'delete_candidate' : action.action,
    archiveMode: 'delete'
  };
}

module.exports = { normalizeArchiveAction };
