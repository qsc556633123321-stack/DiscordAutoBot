const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const TAIPEI_OFFSET_MS = 8 * HOUR_MS;

function formatDuration(ms = 0) {
  const totalMinutes = Math.max(0, Math.floor(Number(ms || 0) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} 分鐘`;
  if (minutes === 0) return `${hours} 小時`;
  return `${hours} 小時 ${minutes} 分鐘`;
}

function getWeekKey(date = new Date()) {
  const taipei = new Date(date.getTime() + TAIPEI_OFFSET_MS);
  const day = taipei.getUTCDay() || 7;
  const monday = new Date(Date.UTC(taipei.getUTCFullYear(), taipei.getUTCMonth(), taipei.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function getMonthKey(date = new Date()) {
  const taipei = new Date(date.getTime() + TAIPEI_OFFSET_MS);
  return `${taipei.getUTCFullYear()}-${String(taipei.getUTCMonth() + 1).padStart(2, '0')}`;
}

function isLateNight(date = new Date()) {
  const taipei = new Date(date.getTime() + TAIPEI_OFFSET_MS);
  const hour = taipei.getUTCHours();
  return hour >= 0 && hour < 5;
}

function calculateLateNightMs(startMs, endMs) {
  let total = 0;
  let cursor = Number(startMs || 0);
  const end = Number(endMs || 0);
  if (!cursor || !end || end <= cursor) return 0;

  while (cursor < end) {
    const next = Math.min(end, cursor + 5 * 60 * 1000);
    if (isLateNight(new Date(cursor))) total += next - cursor;
    cursor = next;
  }
  return total;
}

function buildTitle(stats = {}) {
  const totalMs = stats.totalMs || 0;
  const lateNightMs = stats.lateNightMs || 0;
  const roomCreates = stats.roomCreates || 0;
  const coVoice = stats.coVoiceMs || {};
  const topCoVoiceMs = Math.max(0, ...Object.values(coVoice));

  if (lateNightMs >= 10 * HOUR_MS) return '🌙 深夜常駐';
  if (roomCreates >= 20) return '🎮 開房達人';
  if (totalMs >= 80 * HOUR_MS) return '🎤 語音怪';
  if (topCoVoiceMs >= 30 * HOUR_MS) return '👑 社群核心';
  if (roomCreates >= 8 && totalMs >= 20 * HOUR_MS) return '🔥 熱門房主';
  return '🎧 語音新朋友';
}

function getTopKey(record = {}) {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] || null;
}

function getRoomActivityLabel({ memberCount = 0, createdAt = null } = {}) {
  const ageMs = createdAt ? Date.now() - new Date(createdAt).getTime() : 0;
  if (memberCount >= 4 && ageMs >= 30 * 60 * 1000) return '🔥 熱門房間';
  if (isLateNight(new Date()) && memberCount >= 3) return '🌙 深夜常駐聚集地';
  if (memberCount >= 3) return '🟢 正在升溫';
  return '🎧 開放加入中';
}

function getAiFallbackText(stats = {}) {
  if ((stats.lateNightMs || 0) >= 3 * HOUR_MS) return '最近似乎很常在深夜出沒。';
  if ((stats.roomCreates || 0) >= 5) return '最近很常主動開房，帶起了一點社群節奏。';
  if ((stats.totalMs || 0) >= 10 * HOUR_MS) return '這段時間語音參與度穩定，慢慢變成熟面孔了。';
  return '剛開始累積語音足跡，之後會更看得出社交輪廓。';
}

module.exports = {
  DAY_MS,
  HOUR_MS,
  buildTitle,
  calculateLateNightMs,
  formatDuration,
  getAiFallbackText,
  getMonthKey,
  getRoomActivityLabel,
  getTopKey,
  getWeekKey,
  isLateNight
};
