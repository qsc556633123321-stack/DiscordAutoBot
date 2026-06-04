const SAFE_GAME_DOMAINS = [
  'store.steampowered.com',
  'steamcommunity.com',
  'steampowered.com',
  'help.steampowered.com',
  'playvalorant.com',
  'leagueoflegends.com',
  'riotgames.com',
  'ea.com',
  'epicgames.com',
  'minecraft.net',
  'blizzard.com',
  'battle.net',
  'pathofexile.com',
  'poe2.com'
];

function normalizeHostname(value) {
  return String(value || '').trim().toLowerCase().replace(/^www\./, '');
}

function isExactOrSubdomain(hostname, domain) {
  const host = normalizeHostname(hostname);
  const base = normalizeHostname(domain);
  return host === base || host.endsWith(`.${base}`);
}

function isSafeGameDomain(hostname) {
  return SAFE_GAME_DOMAINS.some((domain) => isExactOrSubdomain(hostname, domain));
}

function isSteamLikeDomain(hostname) {
  return /(steam|steampowered|steamcommunity)/i.test(normalizeHostname(hostname));
}

module.exports = {
  SAFE_GAME_DOMAINS,
  isExactOrSubdomain,
  isSafeGameDomain,
  isSteamLikeDomain,
  normalizeHostname
};
