const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_DATA_DIRECTORY = path.join(__dirname, '..', '..', 'data');
const DEFAULT_ONBOARDING_FILE = path.join(DEFAULT_DATA_DIRECTORY, 'onboarding-flows.json');

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function createCommunityPublicationStateFilesystemAdapter({
  filePath = DEFAULT_ONBOARDING_FILE,
  dataDirectory = DEFAULT_DATA_DIRECTORY,
  filesystem = fs,
  logger = console
} = {}) {
  function ensureFile(file, fallback = '{}') {
    if (!filesystem.existsSync(dataDirectory)) filesystem.mkdirSync(dataDirectory, { recursive: true });
    if (!filesystem.existsSync(file)) filesystem.writeFileSync(file, fallback, 'utf8');
  }

  function readRoot() {
    ensureFile(filePath, '{}');
    try {
      const parsed = JSON.parse(filesystem.readFileSync(filePath, 'utf8') || '{}');
      return isObject(parsed) ? parsed : {};
    } catch (error) {
      logger.error(`Read ${path.basename(filePath)} failed:`, error);
      return {};
    }
  }

  function mergeRecord({ guildId, patch, updatedAt }) {
    const root = readRoot();
    const record = {
      ...(root[guildId] || {}),
      ...patch,
      updatedAt
    };
    const nextRoot = { ...root, [guildId]: record };

    ensureFile(filePath);
    try {
      filesystem.writeFileSync(filePath, `${JSON.stringify(nextRoot, null, 2)}\n`, 'utf8');
      return { persisted: true, record };
    } catch (error) {
      logger.error(`Write ${path.basename(filePath)} failed:`, error);
      return { persisted: false, record };
    }
  }

  return { mergeRecord };
}

module.exports = {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE,
  createCommunityPublicationStateFilesystemAdapter
};
