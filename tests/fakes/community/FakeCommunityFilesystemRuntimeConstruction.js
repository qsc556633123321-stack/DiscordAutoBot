function createFakeCommunityFilesystemRuntimeConstruction({ createBoundary, filePath } = {}) {
  return Object.freeze({
    createReader() {
      const boundary = createBoundary({ filePath });
      return Object.freeze({ readOnboardingState() { return boundary.readOnboardingState({}); } });
    }
  });
}

module.exports = { createFakeCommunityFilesystemRuntimeConstruction };
