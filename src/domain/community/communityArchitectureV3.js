const legacyV3 = require('../../config/communityArchitectureV3');

const categories = legacyV3.CATEGORIES.map((category) => ({ ...category }));
const channels = categories.flatMap((category) => category.channels.map((channel) => ({
  ...channel,
  categoryKey: category.key
})));

const architecture = Object.freeze({
  version: legacyV3.V3_VERSION,
  categoryOrder: [...legacyV3.CATEGORY_ORDER],
  categories,
  channels,
  roles: legacyV3.ROLES.map((role) => ({ ...role })),
  games: legacyV3.GAMES.map((game) => ({ ...game })),
  gameChannels: legacyV3.GAME_CHANNELS.map((channel) => ({ ...channel })),
  visibility: Object.fromEntries(categories.map((category) => [category.key, category.permission])),
  onboardingAllowedChannels: [...legacyV3.ONBOARDING.nativeTaskChannelKeys],
  onboarding: { ...legacyV3.ONBOARDING },
  protectedChannels: [
    'server-logs',
    'ticket-logs',
    'bot-control',
    '語音控制台',
    '整理紀錄',
    '遊戲提議',
    '目前語音房',
    '組隊招募'
  ],
  archiveRules: {
    neverDelete: true,
    oldCategoryKey: 'old_archive',
    gameCategoryKey: 'game_archive'
  },
  gamePlacementRules: {
    popularTier: 'popular',
    dynamicTier: 'player',
    popularAnchorKey: 'popular_games',
    dynamicAnchorKey: 'player_games'
  }
});

module.exports = architecture;
