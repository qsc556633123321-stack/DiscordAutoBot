const { handleConciergeButton } = require('../../../systems/communityConcierge');

const CONCIERGE_PREFIX = 'concierge_';
const GENERIC_FAILURE_PAYLOAD = Object.freeze({
  content: '處理互動導覽時發生錯誤，請稍後再試。',
  ephemeral: true
});

function matches(customId = '') {
  return typeof customId === 'string' && customId.startsWith(CONCIERGE_PREFIX);
}

async function handle(interaction) {
  try {
    await handleConciergeButton(interaction);
  } catch (error) {
    console.error('Concierge button failed:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(GENERIC_FAILURE_PAYLOAD);
    }
  }
}

module.exports = { handle, matches };
