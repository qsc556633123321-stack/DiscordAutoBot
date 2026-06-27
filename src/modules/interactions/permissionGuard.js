function hasPermission(interaction, permission) {
  return Boolean(interaction?.memberPermissions?.has?.(permission));
}

function isOwner(interaction, ownerId) {
  return Boolean(ownerId && interaction?.user?.id === ownerId);
}

function requirePermission(interaction, permission) {
  if (hasPermission(interaction, permission)) return { ok: true };
  return {
    ok: false,
    message: '你沒有執行這個操作所需的權限。'
  };
}

module.exports = {
  hasPermission,
  isOwner,
  requirePermission
};
