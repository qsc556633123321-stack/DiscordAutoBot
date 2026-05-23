function getGameEmoji(game = '') {
  const text = String(game).toLowerCase();
  if (/tft|聯盟戰棋/.test(text)) return '🎮';
  if (/lol|英雄聯盟/.test(text)) return '⚔️';
  if (/minecraft|mc/.test(text)) return '⛏️';
  if (/apex/.test(text)) return '🔫';
  if (/深夜|聊天/.test(text)) return '🌙';
  return '🎮';
}

module.exports = {
  getGameEmoji
};
