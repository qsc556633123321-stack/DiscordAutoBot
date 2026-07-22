function normalizeList(value) {
  return Array.isArray(value) ? value.slice() : [];
}

function createCommandAuditReport(raw = {}) {
  return {
    implemented: normalizeList(raw.implemented),
    invalid: normalizeList(raw.invalid),
    documentedOnly: normalizeList(raw.documentedOnly),
    undocumented: normalizeList(raw.undocumented),
    main: normalizeList(raw.main),
    aliases: normalizeList(raw.aliases),
    deployMode: typeof raw.deployMode === 'string' ? raw.deployMode : 'unknown'
  };
}

module.exports = { createCommandAuditReport };
