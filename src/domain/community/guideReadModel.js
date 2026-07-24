function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeActions(actions) {
  return Array.isArray(actions)
    ? actions
      .filter((action) => action && typeof action === 'object')
      .map((action) => ({
        id: normalizeText(action.id),
        label: normalizeText(action.label),
        style: normalizeText(action.style, 'secondary'),
        emoji: normalizeText(action.emoji),
        disabled: Boolean(action.disabled)
      }))
      .filter((action) => action.id && action.label)
    : [];
}

function normalizeSections(sections) {
  return Array.isArray(sections)
    ? sections
      .filter((section) => section && typeof section === 'object')
      .map((section) => ({
        title: normalizeText(section.title),
        items: Array.isArray(section.items)
          ? section.items.map((item) => normalizeText(item)).filter(Boolean)
          : []
      }))
      .filter((section) => section.title || section.items.length)
    : [];
}

function buildCommunityGuideViewModel({ content = {}, guildName, intro } = {}) {
  const resolvedGuildName = normalizeText(guildName, normalizeText(content.defaultGuildName, 'KU Community'));
  const guideIntro = normalizeText(intro, normalizeText(content.fallbackIntro));

  return {
    guide: {
      color: Number.isInteger(content.color) ? content.color : 0x5865f2,
      title: `${normalizeText(content.titlePrefix, '👋 歡迎來到')} ${resolvedGuildName}`,
      intro: guideIntro,
      sections: normalizeSections(content.sections),
      footer: normalizeText(content.footer)
    },
    actions: normalizeActions(content.actions)
  };
}

module.exports = {
  buildCommunityGuideViewModel
};
