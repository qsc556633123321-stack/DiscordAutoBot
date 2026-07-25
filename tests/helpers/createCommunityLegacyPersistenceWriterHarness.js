function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shallowWrite(root, guildId, patch) {
  return {
    ...root,
    [guildId]: { ...(root[guildId] || {}), ...patch },
  };
}

function createCommunityLegacyPersistenceWriterHarness({ root = {}, readError, parseError, writeError } = {}) {
  let currentRoot = clone(root);
  const calls = [];
  const sideEffects = [];

  function read(writerId) {
    calls.push({ type: 'read', writerId, root: clone(currentRoot) });
    if (readError) throw readError;
    if (parseError) throw parseError;
    return clone(currentRoot);
  }

  function write(writerId, nextRoot) {
    calls.push({ type: 'write', writerId, root: clone(nextRoot) });
    if (writeError) throw writeError;
    currentRoot = clone(nextRoot);
    return clone(currentRoot);
  }

  function snapshot(writerId) {
    return read(writerId);
  }

  function applySnapshot(writerId, snapshotRoot, guildId, patch, { sideEffectBeforeWrite, sideEffectAfterWrite } = {}) {
    if (sideEffectBeforeWrite) sideEffects.push({ writerId, phase: 'before-write', value: sideEffectBeforeWrite });
    const result = write(writerId, shallowWrite(snapshotRoot, guildId, patch));
    if (sideEffectAfterWrite) sideEffects.push({ writerId, phase: 'after-write', value: sideEffectAfterWrite });
    return result;
  }

  return {
    read,
    snapshot,
    applySnapshot,
    getRoot: () => clone(currentRoot),
    calls,
    sideEffects,
  };
}

module.exports = { createCommunityLegacyPersistenceWriterHarness, shallowWrite };
