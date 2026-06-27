const { isSameGame } = require('../../../domain/games/gameIdentityService');

function isDuplicateGameCategory(a, b) {
  if (!a?.name || !b?.name) return false;
  return a.id !== b.id && isSameGame(a.name, b.name);
}

function runDuplicateGameRule(categories = []) {
  const duplicates = [];
  for (let i = 0; i < categories.length; i += 1) {
    for (let j = i + 1; j < categories.length; j += 1) {
      if (isDuplicateGameCategory(categories[i], categories[j])) {
        duplicates.push({ keep: categories[i], duplicate: categories[j] });
      }
    }
  }
  return duplicates;
}

module.exports = { isDuplicateGameCategory, runDuplicateGameRule };
