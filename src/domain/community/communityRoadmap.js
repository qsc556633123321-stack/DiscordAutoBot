const ROADMAP_SECTION_DEFINITIONS = Object.freeze([
  Object.freeze({ key: 'completed', label: '✅ 已完成' }),
  Object.freeze({ key: 'inProgress', label: '🛠 開發中' }),
  Object.freeze({ key: 'future', label: '🌌 未來計畫' })
]);

function createEmptyRoadmap() {
  return { completed: [], inProgress: [], future: [] };
}

function validateRoadmapShape(rawRoadmap) {
  if (!rawRoadmap || typeof rawRoadmap !== 'object' || Array.isArray(rawRoadmap)) {
    return { valid: false, message: 'Community roadmap must be an object.' };
  }

  for (const { key } of ROADMAP_SECTION_DEFINITIONS) {
    if (!Array.isArray(rawRoadmap[key])) {
      return { valid: false, message: `Community roadmap section "${key}" must be an array.` };
    }
  }

  return { valid: true };
}

function normalizeRoadmapItem(rawItem) {
  return String(rawItem);
}

function preserveRoadmapOrder(items) {
  return items.map(normalizeRoadmapItem);
}

function normalizeRoadmap(rawRoadmap) {
  const validation = validateRoadmapShape(rawRoadmap);
  if (!validation.valid) throw new Error(validation.message);

  return Object.freeze(Object.fromEntries(
    ROADMAP_SECTION_DEFINITIONS.map(({ key }) => [key, Object.freeze(preserveRoadmapOrder(rawRoadmap[key]))])
  ));
}

function groupRoadmapItems(items) {
  return ROADMAP_SECTION_DEFINITIONS.map(({ key, label }) => ({
    key,
    label,
    items: items[key]
  }));
}

function calculateRoadmapProgress(items) {
  const total = ROADMAP_SECTION_DEFINITIONS.reduce((count, { key }) => count + items[key].length, 0);
  return total === 0 ? 0 : Math.round((items.completed.length / total) * 100);
}

function buildRoadmapViewModel(rawRoadmap) {
  const roadmap = normalizeRoadmap(rawRoadmap);
  return Object.freeze({
    sections: Object.freeze(groupRoadmapItems(roadmap).map((section) => Object.freeze({
      ...section,
      items: Object.freeze([...section.items])
    }))),
    progress: calculateRoadmapProgress(roadmap)
  });
}

module.exports = {
  ROADMAP_SECTION_DEFINITIONS,
  buildRoadmapViewModel,
  calculateRoadmapProgress,
  createEmptyRoadmap,
  groupRoadmapItems,
  normalizeRoadmap,
  normalizeRoadmapItem,
  preserveRoadmapOrder,
  validateRoadmapShape
};
