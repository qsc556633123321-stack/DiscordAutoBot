const { safeReply, safeFollowUp, safeEditReply } = require('./interactionResponder');

async function handleInteractionError(interaction, error) {
  console.error('Interaction gateway failed:', error);
  const payload = {
    content: '互動處理失敗，請稍後再試或聯絡管理員。',
    ephemeral: true
  };

  if (interaction?.deferred) return safeEditReply(interaction, payload);
  if (interaction?.replied) return safeFollowUp(interaction, payload);
  return safeReply(interaction, payload);
}

module.exports = { handleInteractionError };
