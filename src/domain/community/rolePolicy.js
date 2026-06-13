const architecture = require('./communityArchitectureV3');

function getRoleByKey(key) {
  return architecture.roles.find((role) => role.key === key) || null;
}

function isManagedRoleName(name) {
  return architecture.roles.some((role) => role.name === name || role.aliases?.includes(name));
}

module.exports = { getRoleByKey, isManagedRoleName };
