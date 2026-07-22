function normalizeKeyword(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function keywordKey(value) {
  return normalizeKeyword(value).toLocaleLowerCase();
}

function normalizeCategory(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isSameKeyword(left, right) {
  const leftKey = keywordKey(left);
  return Boolean(leftKey) && leftKey === keywordKey(right);
}

module.exports = { isSameKeyword, keywordKey, normalizeCategory, normalizeKeyword };
