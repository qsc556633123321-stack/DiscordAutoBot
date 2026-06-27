function canRenameWithoutAliasOverride(action) {
  return Boolean(action?.newName) && !action?.aliasOverride;
}

function getRenameTarget(action) {
  return canRenameWithoutAliasOverride(action) ? action.newName : null;
}

module.exports = { canRenameWithoutAliasOverride, getRenameTarget };
