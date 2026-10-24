const crypto = require('node:crypto');

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function stableJson(value) {
  return JSON.stringify(stable(value));
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(stableJson(value)).digest('hex');
}

function assertSnowflake(value, label) {
  if (typeof value !== 'string' || !value) throw new TypeError(`${label} must be a non-empty Discord snowflake string`);
  return value;
}

function sortResources(resources = []) {
  return [...resources].map((resource) => Object.freeze({
    ...resource,
    id: assertSnowflake(resource.id, 'Resource id'),
    parentId: resource.parentId || null,
    permissionOverwrites: Object.freeze([...(resource.permissionOverwrites || [])].sort((left, right) => left.id.localeCompare(right.id)))
  })).sort((left, right) => left.id.localeCompare(right.id));
}

function createCommunitySnapshot({ guildId, capturedAt, schemaVersion = 'community-governance-v1', categories = [], channels = [], roles = [] } = {}) {
  const normalized = Object.freeze({
    guildId: assertSnowflake(guildId, 'Guild id'),
    schemaVersion,
    categories: Object.freeze(sortResources(categories)),
    channels: Object.freeze(sortResources(channels)),
    roles: Object.freeze([...roles].map((role) => Object.freeze({ ...role, id: assertSnowflake(role.id, 'Role id') })).sort((left, right) => left.id.localeCompare(right.id)))
  });
  const contentFingerprint = fingerprint(normalized);
  return Object.freeze({ ...normalized, snapshotId: `${normalized.guildId}:${contentFingerprint}`, capturedAt, fingerprint: contentFingerprint });
}

function permissionFingerprint(permissionOverwrites = []) {
  return fingerprint([...(permissionOverwrites || [])].map((overwrite) => ({ id: overwrite.id, type: overwrite.type, allow: overwrite.allow, deny: overwrite.deny })).sort((left, right) => left.id.localeCompare(right.id)));
}

module.exports = { createCommunitySnapshot, fingerprint, permissionFingerprint, stableJson };
