const COMMUNITY_ABOUT_FACTS = Object.freeze({
  color: 0x57f287,
  title: '🌙 KU Community 是什麼？',
  description: '這是一個偏向深夜遊戲、語音陪伴、AI 工具與社群實驗的 Discord Community OS。\n\n我們重視的是有人感：有人開房、有人聊天、有人一起玩，慢慢變成熟面孔。',
  fields: Object.freeze([
    Object.freeze({ name: '你可以從哪裡開始', value: '`/help-me-start`、領身分組、看看目前語音房、或直接按導覽面板。', inline: false }),
    Object.freeze({ name: '目前伺服器', inline: true }),
    Object.freeze({ name: '核心方向', value: '遊戲、語音、深夜聊天室、AI 社群工具', inline: true })
  ])
});

function createCommunityAboutModel(rawFacts = {}) {
  if (!rawFacts || typeof rawFacts.guildName !== 'string') {
    throw new Error('Community about facts must include a guild name.');
  }

  return Object.freeze({
    embed: {
      color: COMMUNITY_ABOUT_FACTS.color,
      title: COMMUNITY_ABOUT_FACTS.title,
      description: COMMUNITY_ABOUT_FACTS.description,
      fields: COMMUNITY_ABOUT_FACTS.fields.map((field, index) => ({
        ...field,
        ...(index === 1 ? { value: rawFacts.guildName } : {})
      }))
    }
  });
}

module.exports = { COMMUNITY_ABOUT_FACTS, createCommunityAboutModel };
