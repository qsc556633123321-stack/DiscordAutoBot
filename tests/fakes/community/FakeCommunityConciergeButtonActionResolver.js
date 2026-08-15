const COMMUNITY_CONCIERGE_BUTTON_ACTIONS = Object.freeze({
  concierge_games: 'games',
  concierge_invest: 'invest',
  concierge_dev: 'dev',
  concierge_night: 'night',
  concierge_bot: 'bot',
  concierge_roadmap: 'roadmap'
});

function resolveCommunityConciergeButtonAction(customId) {
  if (typeof customId !== 'string') return null;
  return COMMUNITY_CONCIERGE_BUTTON_ACTIONS[customId] || null;
}

module.exports = {
  COMMUNITY_CONCIERGE_BUTTON_ACTIONS,
  resolveCommunityConciergeButtonAction
};
