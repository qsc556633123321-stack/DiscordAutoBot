const OpenAI = require('openai');

function extractJsonArray(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) return JSON.parse(trimmed);

  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response does not contain a JSON array.');
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

function sanitizeSuggestions(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      channelName: String(item.channelName || '').slice(0, 100),
      suggestedCategory: String(item.suggestedCategory || '').slice(0, 100),
      confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'low',
      reason: String(item.reason || '').slice(0, 300)
    }))
    .filter((item) => item.channelName && item.suggestedCategory && !item.channelName.startsWith('ticket-'));
}

async function analyzeUncertainChannels({ guildName, categories, channels }) {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const safeChannels = channels
    .filter((channel) => channel && channel.name && !channel.name.startsWith('ticket-'))
    .slice(0, 20);

  if (!safeChannels.length) return [];

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          '你是 Discord 伺服器管理顧問。請使用繁體中文。' +
          '你只能根據頻道名稱、頻道類型、目前分類與附近頻道，提供整理建議。' +
          '優先使用現有分類；如果真的需要新分類，可以建議新分類。' +
          '不可建議刪除頻道，不可建議改名頻道，不可處理 ticket- 開頭頻道。' +
          '對低信心要保守。只回傳純 JSON，不要 markdown。' +
          'JSON 格式必須是 {"suggestions":[{"channelName":"xxx","suggestedCategory":"xxx","confidence":"high|medium|low","reason":"xxx"}]}。'
      },
      {
        role: 'user',
        content: JSON.stringify({
          guildName,
          categories,
          channels: safeChannels
        })
      }
    ]
  });

  const content = completion.choices[0]?.message?.content || '{"suggestions":[]}';
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    parsed = extractJsonArray(content);
  }

  const suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions;

  return sanitizeSuggestions(suggestions);
}

module.exports = {
  analyzeUncertainChannels,
  extractJsonArray
};
