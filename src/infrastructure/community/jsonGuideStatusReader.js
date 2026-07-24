const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ONBOARDING_FILE = path.join(__dirname, '..', '..', 'data', 'onboarding-flows.json');

function createJsonGuideStatusReader({ filePath = DEFAULT_ONBOARDING_FILE, readFile = fs.readFileSync } = {}) {
  return {
    async readGuideStatus(guildId) {
      try {
        const parsed = JSON.parse(readFile(filePath, 'utf8') || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed[guildId] && typeof parsed[guildId] === 'object'
          ? parsed[guildId]
          : {};
      } catch {
        return {};
      }
    }
  };
}

module.exports = { DEFAULT_ONBOARDING_FILE, createJsonGuideStatusReader };
