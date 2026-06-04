const OpenAI = require('openai');
const { protectedReason } = require('./layoutDecisionEngine');
const { validateLayoutAction } = require('../config/communityRules');

function compactGuildLayout(guild) {
  return [...guild.channels.cache.values()].map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.type,
    parent: channel.parent?.name || null,
    lastMessageId: channel.lastMessageId || null,
    isProtected: Boolean(protectedReason(guild, channel))
  }));
}

function parseAiJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = String(text || '').match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) return [];
    try {
      return JSON.parse(match[0]);
    } catch {
      return [];
    }
  }
}

async function getAiLayoutSuggestions(guild, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    return { used: false, votes: [], notes: ['未設定 OPENAI_API_KEY，略過 AI 建議。'] };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const layout = compactGuildLayout(guild);
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_LAYOUT_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: [
            '你是 Discord 社群結構分析顧問。請使用繁體中文。',
            '你只能提出建議，不可直接執行。',
            '不可建議刪除 protected channel、ticket、logs、bot-control、active temp voice、LFG、Voice Hub、遊戲提議、onboarding required channels。',
            '若信心低於 80，不可建議 delete，只能 archive 或 keep。',
            '回傳純 JSON，不要 markdown。格式：{"votes":[{"channelId":"id","action":"keep|rename|move|archive|delete|sync_permission","confidence":0-100,"reason":"...","targetName":"...","targetCategoryKey":"..."}],"notes":["..."]}'
          ].join('\n')
        },
        {
          role: 'user',
          content: JSON.stringify({
            guildName: guild.name,
            scope: options.scope || 'all',
            layout
          })
        }
      ]
    });
    const parsed = parseAiJson(response.choices?.[0]?.message?.content || '{}');
    const payload = Array.isArray(parsed) ? { votes: parsed, notes: [] } : parsed;
    const votes = (payload.votes || []).filter((vote) => {
      const channel = guild.channels.cache.get(vote.channelId);
      if (!channel) return false;
      if (protectedReason(guild, channel) && vote.action === 'delete') return false;
      if (vote.action === 'delete' && Number(vote.confidence || 0) < 80) return false;
      const validation = validateLayoutAction({
        ...vote,
        targetId: vote.channelId,
        targetName: vote.targetName || channel.name,
        newName: vote.newName || vote.targetName
      }, { channel });
      if (!validation.allowed) return false;
      return true;
    });
    return {
      used: true,
      votes,
      notes: payload.notes || []
    };
  } catch (error) {
    console.error('[AI Layout Planner] failed:', error);
    return {
      used: false,
      votes: [],
      notes: [`AI 建議暫時失敗：${error.message}`]
    };
  }
}

module.exports = {
  getAiLayoutSuggestions
};
