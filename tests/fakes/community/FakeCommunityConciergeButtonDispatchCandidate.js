const CONCIERGE_PREFIX = 'concierge_';
const GENERIC_FAILURE_PAYLOAD = Object.freeze({
  content: '處理互動導覽時發生錯誤，請稍後再試。',
  ephemeral: true
});

function matchesCommunityConciergeButton(customId = '') {
  return customId.startsWith(CONCIERGE_PREFIX);
}

async function dispatchCommunityConciergeButton({ interaction, handleConciergeButton, logError } = {}) {
  if (!matchesCommunityConciergeButton(interaction?.customId || '')) {
    return Object.freeze({ matched: false, handlerReturn: undefined });
  }

  try {
    const handlerReturn = await handleConciergeButton(interaction);
    return Object.freeze({ matched: true, handlerReturn });
  } catch (error) {
    logError?.('Concierge button failed:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(GENERIC_FAILURE_PAYLOAD);
    }
    return Object.freeze({ matched: true, handlerReturn: undefined });
  }
}

module.exports = {
  CONCIERGE_PREFIX,
  GENERIC_FAILURE_PAYLOAD,
  dispatchCommunityConciergeButton,
  matchesCommunityConciergeButton
};
