const defaultFilesystem = require('node:fs');
const defaultPathModule = require('node:path');

function assertFunction(value, name) {
  if (typeof value !== 'function') {
    throw new TypeError(`CommunityOnboardingJsonReader requires ${name}`);
  }
}

function assertDependencies({ filesystem, pathModule, logger }) {
  if (!filesystem || typeof filesystem !== 'object') {
    throw new TypeError('CommunityOnboardingJsonReader requires filesystem');
  }
  assertFunction(filesystem.existsSync, 'filesystem.existsSync');
  assertFunction(filesystem.mkdirSync, 'filesystem.mkdirSync');
  assertFunction(filesystem.writeFileSync, 'filesystem.writeFileSync');
  assertFunction(filesystem.readFileSync, 'filesystem.readFileSync');
  if (!pathModule || typeof pathModule !== 'object') {
    throw new TypeError('CommunityOnboardingJsonReader requires pathModule');
  }
  assertFunction(pathModule.basename, 'pathModule.basename');
  if (!logger || typeof logger !== 'object') {
    throw new TypeError('CommunityOnboardingJsonReader requires logger');
  }
  assertFunction(logger.error, 'logger.error');
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function createCommunityOnboardingJsonReader({
  dataDirectory,
  filePath,
  filesystem = defaultFilesystem,
  pathModule = defaultPathModule,
  logger = console
} = {}) {
  assertDependencies({ filesystem, pathModule, logger });

  return Object.freeze({
    readRoot(fallback = {}) {
      if (!filesystem.existsSync(dataDirectory)) {
        filesystem.mkdirSync(dataDirectory, { recursive: true });
      }
      if (!filesystem.existsSync(filePath)) {
        filesystem.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
      }

      try {
        const parsed = JSON.parse(filesystem.readFileSync(filePath, 'utf8') || '{}');
        return isObject(parsed) ? parsed : fallback;
      } catch (error) {
        logger.error(`Read ${pathModule.basename(filePath)} failed:`, error);
        return fallback;
      }
    }
  });
}

module.exports = { createCommunityOnboardingJsonReader };
