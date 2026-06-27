async function safeReply(interaction, payload) {
  try {
    if (!interaction || interaction.replied || interaction.deferred) return null;
    return await interaction.reply(payload);
  } catch (error) {
    return null;
  }
}

async function safeEditReply(interaction, payload) {
  try {
    if (!interaction || (!interaction.replied && !interaction.deferred)) return null;
    return await interaction.editReply(payload);
  } catch (error) {
    return null;
  }
}

async function safeFollowUp(interaction, payload) {
  try {
    if (!interaction) return null;
    return await interaction.followUp(payload);
  } catch (error) {
    return null;
  }
}

async function deferIfNeeded(interaction, options = {}) {
  try {
    if (!interaction || interaction.replied || interaction.deferred) return false;
    await interaction.deferReply(options);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  deferIfNeeded,
  safeEditReply,
  safeFollowUp,
  safeReply
};
