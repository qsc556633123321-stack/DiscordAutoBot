const { fail, ok } = require('../../core/result');
const { getOpenAIClient } = require('./openaiClient');

async function plan(request) {
  const client = getOpenAIClient();
  if (!client) return fail('AI_NOT_CONFIGURED', 'OPENAI_API_KEY is not configured.');
  return ok({ client, request });
}

module.exports = { plan };
