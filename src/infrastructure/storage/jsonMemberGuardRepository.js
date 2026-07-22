const path = require('node:path');
const { readJson, updateJson } = require('./jsonStore');
const { normalizeSettings } = require('../../domain/memberGuard/memberGuardPolicy');

const SETTINGS_FILE = path.join(__dirname, '..', '..', 'data', 'member-guard-settings.json');

function createJsonMemberGuardRepository({ filePath = SETTINGS_FILE } = {}) {
  function all() {
    const value = readJson(filePath, {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  return {
    getSettings(guildId) {
      return normalizeSettings(all()[guildId] || {});
    },
    isEnabled(guildId) {
      return this.getSettings(guildId).enabled;
    },
    listProtectedMemberIds(guildId) {
      return this.getSettings(guildId).protectedMemberIds;
    },
    listAllowedRoleIds(guildId) {
      return this.getSettings(guildId).whitelistedRoleIds;
    },
    getStatus(guildId) {
      return this.getSettings(guildId);
    },
    updateSettings(guildId, patch = {}) {
      let next;
      updateJson(filePath, (current) => {
        const records = current && typeof current === 'object' ? current : {};
        next = {
          ...normalizeSettings(records[guildId] || {}),
          ...patch,
          updatedAt: new Date().toISOString()
        };
        records[guildId] = next;
        return records;
      }, {});
      return normalizeSettings(next);
    }
  };
}

module.exports = { SETTINGS_FILE, createJsonMemberGuardRepository };
