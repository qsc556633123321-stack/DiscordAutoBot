function runGuestGateRule(record) {
  const visibilityType = record?.config?.visibilityType || record?.category?.visibilityType;
  if (!visibilityType) return null;
  return {
    action: 'repair_permission',
    confidence: 90,
    risk: 'low',
    reason: `visibilityType=${visibilityType}`,
    targetName: record?.current?.name || record?.config?.name,
    visibilityType
  };
}

module.exports = { runGuestGateRule };
