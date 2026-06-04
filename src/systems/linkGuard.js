const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const { writeServerLog } = require('./serverLogs');
const { SAFE_GAME_DOMAINS, isSafeGameDomain, isSteamLikeDomain } = require('../config/gameDomains');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'link-guard-settings.json');
const userLinkBuckets = new Map();

const DEFAULT_WHITELIST = [
  'youtube.com',
  'youtu.be',
  'twitch.tv',
  'steamcommunity.com',
  'discord.com',
  'github.com',
  'google.com',
  'bahamut.com.tw',
  'gamer.com.tw',
  ...SAFE_GAME_DOMAINS
];

const HIGH_RISK_KEYWORDS = [
  'grabify',
  'iplogger',
  '2no.co',
  'yip.su',
  'bit.ly',
  'tinyurl',
  'shorturl',
  'reurl',
  'cutt.ly',
  'is.gd',
  't.co',
  'discord-nitro',
  'free-nitro',
  'steamcommunity.ru',
  'steamcomrnunity',
  'stearncommunity',
  'roblox-free',
  'gift-nitro',
  'login-discord',
  'verify-discord',
  'discordgift',
  'air-drop',
  'airdrop'
];

const SHORTENER_KEYWORDS = [
  'bit.ly',
  'tinyurl',
  'shorturl',
  'reurl',
  'cutt.ly',
  'is.gd',
  't.co',
  '2no.co',
  'yip.su'
];

const DEFAULT_SETTINGS = {
  enabled: true,
  blockInvites: true,
  blockShorteners: true,
  newAccountDays: 7,
  newAccountTimeoutMinutes: 10,
  linkSpamLimit: 3,
  linkSpamWindowSeconds: 60,
  linkSpamTimeoutMinutes: 5,
  allowedDomains: DEFAULT_WHITELIST,
  allowedInvites: [],
  whitelistedRoleIds: []
};

function ensureSettingsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) fs.writeFileSync(SETTINGS_FILE, '{}', 'utf8');
}

function readAllSettings() {
  ensureSettingsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('讀取 link-guard-settings.json 失敗:', error);
    return {};
  }
}

function writeAllSettings(data) {
  ensureSettingsFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('寫入 link-guard-settings.json 失敗:', error);
  }
}

function normalizeDomain(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function getLinkGuardSettings(guildId) {
  const data = readAllSettings();
  const saved = data[guildId] || {};
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    allowedDomains: [...new Set([...(DEFAULT_SETTINGS.allowedDomains || []), ...((saved.allowedDomains || []).map(normalizeDomain))])],
    allowedInvites: [...new Set(saved.allowedInvites || [])],
    whitelistedRoleIds: [...new Set(saved.whitelistedRoleIds || [])]
  };
}

function updateLinkGuardSettings(guildId, updates) {
  const data = readAllSettings();
  const current = getLinkGuardSettings(guildId);
  data[guildId] = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeAllSettings(data);
  return data[guildId];
}

function addWhitelistDomain(guildId, domain) {
  const settings = getLinkGuardSettings(guildId);
  const normalized = normalizeDomain(domain);
  if (!normalized) return settings;
  return updateLinkGuardSettings(guildId, {
    allowedDomains: [...new Set([...settings.allowedDomains, normalized])]
  });
}

function removeWhitelistDomain(guildId, domain) {
  const normalized = normalizeDomain(domain);
  const settings = getLinkGuardSettings(guildId);
  return updateLinkGuardSettings(guildId, {
    allowedDomains: settings.allowedDomains.filter((item) => item !== normalized)
  });
}

function addWhitelistInvite(guildId, inviteCode) {
  const settings = getLinkGuardSettings(guildId);
  const normalized = String(inviteCode || '').trim().toLowerCase();
  if (!normalized) return settings;
  return updateLinkGuardSettings(guildId, {
    allowedInvites: [...new Set([...settings.allowedInvites, normalized])]
  });
}

function removeWhitelistInvite(guildId, inviteCode) {
  const normalized = String(inviteCode || '').trim().toLowerCase();
  const settings = getLinkGuardSettings(guildId);
  return updateLinkGuardSettings(guildId, {
    allowedInvites: settings.allowedInvites.filter((item) => item !== normalized)
  });
}

function isTicketChannel(channel) {
  return channel?.name?.startsWith('ticket-') || /ticket|客服/i.test(channel?.parent?.name || '');
}

function isWhitelisted(message, settings) {
  if (!message.guild || !message.member) return true;
  if (message.author.bot) return true;
  if (isTicketChannel(message.channel)) return true;

  const perms = message.member.permissions;
  if (
    perms.has(PermissionFlagsBits.Administrator) ||
    perms.has(PermissionFlagsBits.ManageGuild) ||
    perms.has(PermissionFlagsBits.ManageMessages)
  ) {
    return true;
  }

  return settings.whitelistedRoleIds.some((roleId) => message.member.roles.cache.has(roleId));
}

function extractUrls(content) {
  const matches = String(content || '').match(/(?:https?:\/\/|www\.)[^\s<>()]+|discord\.gg\/[a-z0-9-]+|discord(?:app)?\.com\/invite\/[a-z0-9-]+/gi) || [];
  return matches.map((raw) => {
    const cleaned = raw.replace(/[),.。！？!?]+$/g, '');
    const withProtocol = cleaned.startsWith('www.') ? `https://${cleaned}` : cleaned;
    try {
      const url = new URL(withProtocol.startsWith('http') ? withProtocol : `https://${withProtocol}`);
      return {
        raw: cleaned,
        href: url.href.toLowerCase(),
        hostname: normalizeDomain(url.hostname),
        pathname: url.pathname.toLowerCase()
      };
    } catch (error) {
      return {
        raw: cleaned,
        href: cleaned.toLowerCase(),
        hostname: normalizeDomain(cleaned),
        pathname: ''
      };
    }
  });
}

function domainMatches(domain, allowedDomain) {
  return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`);
}

function isAllowedDomain(domain, settings) {
  return settings.allowedDomains.some((allowed) => domainMatches(domain, allowed));
}

function getInviteCode(url) {
  const text = `${url.hostname}${url.pathname}`.toLowerCase();
  const match = text.match(/(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function isExternalLink(url) {
  return Boolean(url.hostname);
}

async function classifySteamLikeUrlWithAi(url) {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '判斷網址是否偽裝 Steam 官方網站、釣魚登入頁、免費禮物詐騙、帳號驗證詐騙。只能回傳 SAFE、SUSPICIOUS、MALICIOUS 其中一個字。'
        },
        {
          role: 'user',
          content: JSON.stringify({ hostname: url.hostname, href: url.href, path: url.pathname })
        }
      ],
      temperature: 0,
      max_tokens: 8
    });
    const verdict = response.choices?.[0]?.message?.content?.trim()?.toUpperCase();
    return ['SAFE', 'SUSPICIOUS', 'MALICIOUS'].includes(verdict) ? verdict : null;
  } catch (error) {
    console.error('Steam-like AI classification failed:', error.message);
    return null;
  }
}

function isNewAccount(member, days) {
  return Date.now() - member.user.createdTimestamp < days * 24 * 60 * 60 * 1000;
}

function detectLinkSpam(message, settings, linkCount) {
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  const windowMs = settings.linkSpamWindowSeconds * 1000;
  const bucket = (userLinkBuckets.get(key) || []).filter((time) => now - time <= windowMs);
  for (let index = 0; index < linkCount; index += 1) bucket.push(now);
  userLinkBuckets.set(key, bucket);
  return bucket.length > settings.linkSpamLimit;
}

async function analyzeUrl(url, settings) {
  const haystack = `${url.href} ${url.hostname} ${url.pathname}`.toLowerCase();
  const inviteCode = getInviteCode(url);

  if (isSafeGameDomain(url.hostname) && !inviteCode) {
    return { blocked: false, allowed: true, reason: 'SAFE game link allowed', domain: url.hostname || url.raw, safeGameDomain: true };
  }

  if (HIGH_RISK_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return { blocked: true, reason: '高風險黑名單關鍵字', domain: url.hostname || url.raw };
  }

  if (settings.blockInvites && inviteCode && !settings.allowedInvites.includes(inviteCode)) {
    return { blocked: true, reason: '未允許的 Discord 邀請連結', domain: url.hostname || 'discord invite' };
  }

  if (settings.blockShorteners && SHORTENER_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return { blocked: true, reason: '短網址或追蹤連結', domain: url.hostname || url.raw };
  }

  if (/(disc0rd|d1scord|stearn|comrnunity)/i.test(haystack)) {
    return { blocked: true, reason: '疑似仿冒網域', domain: url.hostname || url.raw };
  }

  if (isSteamLikeDomain(url.hostname) && !isSafeGameDomain(url.hostname)) {
    const verdict = await classifySteamLikeUrlWithAi(url);
    if (verdict === 'SAFE') {
      return { blocked: false, allowed: true, reason: 'SAFE steam-like link allowed by AI', domain: url.hostname || url.raw, aiVerdict: verdict };
    }
    if (verdict === 'SUSPICIOUS') {
      return { blocked: true, reason: 'suspicious steam-like link blocked', domain: url.hostname || url.raw, aiVerdict: verdict };
    }
    if (verdict === 'MALICIOUS') {
      return { blocked: true, reason: 'malicious steam-like link blocked', domain: url.hostname || url.raw, timeoutMinutes: settings.newAccountTimeoutMinutes, aiVerdict: verdict };
    }
    return { blocked: true, reason: '非官方 steam-like domain，AI 失敗 fallback 封鎖', domain: url.hostname || url.raw };
  }

  const sensitiveBrand = /(discord|steam|nitro|gift|login|verify)/i.test(haystack);
  const official = isAllowedDomain(url.hostname, settings);
  if (sensitiveBrand && !official) {
    return { blocked: true, reason: '疑似釣魚或盜帳號連結', domain: url.hostname || url.raw };
  }

  return { blocked: false, domain: url.hostname || url.raw };
}

async function deleteMessage(message) {
  try {
    if (message.deletable) await message.delete();
    return true;
  } catch (error) {
    console.error('Link Guard delete failed:', error);
    return false;
  }
}

async function timeoutMember(message, minutes, reason) {
  try {
    if (!message.member || !message.member.moderatable) return false;
    await message.member.timeout(minutes * 60 * 1000, reason);
    return true;
  } catch (error) {
    console.error('Link Guard timeout failed:', error);
    return false;
  }
}

async function warnUser(message, reason) {
  try {
    const warning = await message.channel.send({
      content: `${message.author} Link Guard 已移除可疑連結：${reason}`
    });
    setTimeout(() => warning.delete().catch(() => null), 8000);
  } catch (error) {
    console.error('Link Guard warning failed:', error);
  }
}

function redactContent(content) {
  return String(content || '')
    .replace(/(token|password|secret|authorization)[=:]\S+/gi, '$1=[redacted]')
    .slice(0, 200);
}

async function logLinkGuard(message, result) {
  await writeServerLog(message.guild, {
    title: result.allowed ? '✅ SAFE game link allowed' : '🚨 Link Guard 阻擋連結',
    color: result.allowed ? 0x57f287 : 0xeb5757,
    description: result.allowed ? '允許官方或 AI 判定安全的遊戲連結。' : '偵測到可疑連結並已執行防護。',
    fields: [
      { name: '使用者', value: `${message.author.tag} (${message.author.id})`, inline: false },
      { name: '頻道', value: `${message.channel}`, inline: true },
      { name: '原因', value: result.reason || '未知', inline: true },
      { name: '網域', value: result.domain || '未知', inline: true },
      { name: '動作', value: result.action || '刪除訊息', inline: false },
      { name: '訊息內容前 200 字', value: redactContent(message.content) || '無內容', inline: false }
    ]
  });
}

async function applyLinkGuardAction(message, settings, result) {
  const deleted = await deleteMessage(message);
  let action = deleted ? '刪除訊息' : '嘗試刪除失敗';

  if (result.timeoutMinutes) {
    const timedOut = await timeoutMember(message, result.timeoutMinutes, result.reason);
    action += timedOut ? ` + timeout ${result.timeoutMinutes} 分鐘` : ' + timeout 失敗或無權限';
  }

  const finalResult = { ...result, action };
  await warnUser(message, result.reason);
  await logLinkGuard(message, finalResult);
  return true;
}

async function handleLinkGuardMessage(message) {
  if (!message.guild || !message.content) return false;
  const settings = getLinkGuardSettings(message.guild.id);
  if (!settings.enabled || isWhitelisted(message, settings)) return false;

  const urls = extractUrls(message.content);
  if (!urls.length) return false;
  let strictMode = false;
  try {
    const { shouldUseStrictLinkGuard } = require('./memberGuard');
    strictMode = shouldUseStrictLinkGuard(message.member);
  } catch (error) {
    strictMode = false;
  }

  if (strictMode) {
    const blockedUrl = urls.find((url) => getInviteCode(url) || !isAllowedDomain(url.hostname, settings));
    if (blockedUrl) {
      return applyLinkGuardAction(message, settings, {
        reason: 'Member Guard 嚴格模式：訪客、新帳號或 safe_mode 期間只允許白名單網域',
        domain: blockedUrl.hostname || blockedUrl.raw,
        timeoutMinutes: settings.newAccountTimeoutMinutes
      });
    }
  }

  if (settings.newAccountDays > 0 && isNewAccount(message.member, settings.newAccountDays) && urls.some(isExternalLink)) {
    const blockedUrl = urls.find((url) => {
      const haystack = `${url.href} ${url.hostname}`.toLowerCase();
      return getInviteCode(url) ||
        SHORTENER_KEYWORDS.some((keyword) => haystack.includes(keyword)) ||
        (isSteamLikeDomain(url.hostname) && !isSafeGameDomain(url.hostname)) ||
        !isSafeGameDomain(url.hostname);
    });
    if (blockedUrl) {
      return applyLinkGuardAction(message, settings, {
        reason: `新帳號 ${settings.newAccountDays} 天內只允許官方白名單遊戲網址`,
        domain: blockedUrl.hostname || blockedUrl.raw,
        timeoutMinutes: settings.newAccountTimeoutMinutes
      });
    }
  }

  if (detectLinkSpam(message, settings, urls.length)) {
    return applyLinkGuardAction(message, settings, {
      reason: `${settings.linkSpamWindowSeconds} 秒內發送過多連結`,
      domain: urls[0].hostname || urls[0].raw,
      timeoutMinutes: settings.linkSpamTimeoutMinutes
    });
  }

  for (const url of urls) {
    const result = await analyzeUrl(url, settings);
    if (result.allowed) {
      await logLinkGuard(message, { ...result, action: '允許' }).catch(() => null);
      continue;
    }
    if (isAllowedDomain(url.hostname, settings) && !getInviteCode(url) && !isSteamLikeDomain(url.hostname)) continue;
    if (result.blocked) return applyLinkGuardAction(message, settings, result);
  }

  return false;
}

module.exports = {
  addWhitelistDomain,
  addWhitelistInvite,
  getLinkGuardSettings,
  handleLinkGuardMessage,
  removeWhitelistDomain,
  removeWhitelistInvite,
  updateLinkGuardSettings
};
