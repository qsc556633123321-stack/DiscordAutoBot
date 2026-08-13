function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function createFakeCommunityOnboardingFilesystemBoundary({ dataDirectory, filePath, filesystem, pathModule, logger } = {}) {
  return Object.freeze({
    readOnboardingState(fallback = {}) {
      if (!filesystem.existsSync(dataDirectory)) filesystem.mkdirSync(dataDirectory, { recursive: true });
      if (!filesystem.existsSync(filePath)) filesystem.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
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

module.exports = { createFakeCommunityOnboardingFilesystemBoundary };
