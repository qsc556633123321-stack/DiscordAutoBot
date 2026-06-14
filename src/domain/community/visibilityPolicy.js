const architecture = require('./communityArchitectureV3');
const { roleCanAccessCategory } = require('./permissionMatrix');

const PUBLIC_VISIBILITY = new Set(['public_entry', 'public_readonly']);

function isGuestVisible(categoryOrPermission) {
  const permission = typeof categoryOrPermission === 'string'
    ? categoryOrPermission
    : categoryOrPermission?.permission;
  return PUBLIC_VISIBILITY.has(permission);
}

function isFormalMemberVisible(categoryOrPermission) {
  const permission = typeof categoryOrPermission === 'string'
    ? categoryOrPermission
    : categoryOrPermission?.permission;
  return ['formal_member', 'formal_readonly'].includes(permission);
}

function getCategoryVisibility(categoryKey) {
  return architecture.visibility[categoryKey] || 'hidden';
}

module.exports = { getCategoryVisibility, isFormalMemberVisible, isGuestVisible, roleCanAccessCategory };
