const architecture = require('./communityArchitectureV3');

const normalizedProtected = architecture.protectedChannels.map((name) => name.toLowerCase());

function isProtectedChannel(channel) {
  const name = String(channel?.name || '').toLowerCase();
  return name.startsWith('ticket-') ||
    normalizedProtected.some((protectedName) => name.includes(protectedName)) ||
    Boolean(channel?.isSystemChannel);
}

function canRename(channel) {
  return !isProtectedChannel(channel);
}

function canMove(channel) {
  return !isProtectedChannel(channel);
}

function canArchive(channel) {
  return !isProtectedChannel(channel);
}

function canDelete() {
  return false;
}

module.exports = { canArchive, canDelete, canMove, canRename, isProtectedChannel };
