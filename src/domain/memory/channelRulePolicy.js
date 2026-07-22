const { fail, ok } = require('../../core/result');
const { normalizeCategory, normalizeKeyword } = require('./channelRule');

function validateChannelRuleInput({ keyword, category, weight }) {
  const normalizedKeyword = normalizeKeyword(keyword);
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedKeyword) return fail('CHANNEL_RULE_KEYWORD_REQUIRED', 'Keyword is required.');
  if (!normalizedCategory) return fail('CHANNEL_RULE_CATEGORY_REQUIRED', 'Category is required.');
  if (!Number.isInteger(weight) || weight < 1 || weight > 10) {
    return fail('CHANNEL_RULE_WEIGHT_INVALID', 'Weight must be an integer between 1 and 10.');
  }
  return ok({ keyword: normalizedKeyword, category: normalizedCategory, weight });
}

function createChannelRule(input, timestamp) {
  const validation = validateChannelRuleInput(input);
  if (!validation.ok) return validation;
  return ok({ ...validation.data, createdAt: timestamp, updatedAt: timestamp });
}

function updateChannelRule(existing, input, timestamp) {
  const validation = validateChannelRuleInput(input);
  if (!validation.ok) return validation;
  return ok({
    ...validation.data,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp
  });
}

module.exports = { createChannelRule, updateChannelRule, validateChannelRuleInput };
