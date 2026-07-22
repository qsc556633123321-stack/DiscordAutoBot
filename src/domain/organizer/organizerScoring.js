const CATEGORY_RULES = [
  { categoryName: '📌｜社群入口', keywords: [{ text: '規則', weight: 5 }, { text: '公告', weight: 5 }, { text: '驗證', weight: 4 }, { text: '身分', weight: 3 }, { text: '身分組', weight: 4 }, { text: '新人報到', weight: 4 }, { text: '說明', weight: 2 }] },
  { categoryName: '💬｜日常大廳', keywords: [{ text: '一般聊天', weight: 5 }, { text: '聊天', weight: 5 }, { text: '閒聊', weight: 5 }, { text: '美食分享', weight: 5 }, { text: '好圖分享', weight: 5 }, { text: '私人限定討論區', weight: 5 }] },
  { categoryName: '🎮｜遊戲大廳', keywords: [{ text: '找隊友', weight: 5 }, { text: '戰績', weight: 3 }, { text: '戰績分享', weight: 5 }, { text: '遊戲討論', weight: 5 }] },
  { categoryName: '🔊｜遊戲語音', keywords: [{ text: 'apex', weight: 5 }, { text: '特戰', weight: 5 }, { text: 'lol', weight: 5 }, { text: 'minecraft', weight: 5 }, { text: '掛機睡覺', weight: 5 }, { text: '語音', weight: 4 }, { text: '討論區', weight: 3 }] },
  { categoryName: '🔒｜管理員後台', keywords: [{ text: '管理', weight: 5 }, { text: 'log', weight: 5 }, { text: 'logs', weight: 5 }, { text: '紀錄', weight: 4 }, { text: '審核', weight: 4 }, { text: '後台', weight: 5 }] },
  { categoryName: '🎫｜客服支援', keywords: [{ text: 'ticket', weight: 5 }, { text: '客服', weight: 5 }, { text: '支援', weight: 4 }, { text: '回報', weight: 4 }, { text: '問題', weight: 3 }] },
  { categoryName: '📈｜投資討論區', keywords: [{ text: '股票', weight: 5 }, { text: '投資', weight: 5 }, { text: '台股', weight: 5 }, { text: '盤勢', weight: 4 }, { text: 'AI分析', weight: 3 }] },
  { categoryName: '🛠｜開發專區', keywords: [{ text: '專案', weight: 5 }, { text: '開發', weight: 5 }, { text: 'api', weight: 4 }, { text: '程式', weight: 4 }, { text: 'github', weight: 4 }, { text: 'codex', weight: 4 }] },
  { categoryName: '🎉｜活動專區', keywords: [{ text: '活動規劃', weight: 6 }, { text: '活動公告', weight: 6 }, { text: '投票區', weight: 6 }, { text: '活動', weight: 5 }, { text: '賽事', weight: 5 }, { text: '抽獎', weight: 4 }, { text: '投票', weight: 4 }] }
];

function normalizeName(name) {
  return String(name || '').toLowerCase().replace(/[\s_\-｜|#]+/g, '');
}

function scoreChannelName(channelName, memoryRules = []) {
  const normalized = normalizeName(channelName);
  const categoryScores = new Map(CATEGORY_RULES.map((rule) => [rule.categoryName, {
    categoryName: rule.categoryName, score: 0, matches: []
  }]));

  for (const rule of CATEGORY_RULES) {
    const current = categoryScores.get(rule.categoryName);
    for (const keyword of rule.keywords) {
      if (normalized.includes(normalizeName(keyword.text))) {
        current.score += keyword.weight;
        current.matches.push(`${keyword.text}+${keyword.weight}`);
      }
    }
  }

  for (const memoryRule of memoryRules) {
    if (!memoryRule?.keyword || !memoryRule?.category || !normalized.includes(normalizeName(memoryRule.keyword))) continue;
    const weight = Number(memoryRule.weight) || 5;
    const current = categoryScores.get(memoryRule.category) || { categoryName: memoryRule.category, score: 0, matches: [] };
    current.score += weight;
    current.matches.push(`命中伺服器記憶：${memoryRule.keyword} +${weight}`);
    categoryScores.set(memoryRule.category, current);
  }

  const scores = [...categoryScores.values()].sort((a, b) => b.score - a.score);
  const top = scores[0] || { score: 0, categoryName: '無', matches: [] };
  const second = scores[1] || { score: 0, categoryName: '無', matches: [] };
  return { top, second, gap: top.score - second.score, scores };
}

module.exports = { CATEGORY_RULES, normalizeName, scoreChannelName };
