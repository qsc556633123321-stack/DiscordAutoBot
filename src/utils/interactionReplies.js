async function safeDeferReply(interaction, options = { ephemeral: true }) {
  if (interaction.deferred || interaction.replied) return false;
  try {
    await interaction.deferReply(options);
    return true;
  } catch (error) {
    console.error('safeDeferReply failed:', error);
    return false;
  }
}

async function safeReply(interaction, payload) {
  try {
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(payload);
    }
    return await interaction.reply(payload);
  } catch (error) {
    console.error('safeReply failed:', error);
    return null;
  }
}

async function safeEditReply(interaction, payload) {
  try {
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(payload);
    }
    return await interaction.reply(payload);
  } catch (error) {
    console.error('safeEditReply failed:', error);
    return null;
  }
}

async function safeDeferUpdate(interaction) {
  if (interaction.deferred || interaction.replied) return false;
  try {
    await interaction.deferUpdate();
    return true;
  } catch (error) {
    console.error('safeDeferUpdate failed:', error);
    return false;
  }
}

module.exports = {
  safeDeferReply,
  safeDeferUpdate,
  safeEditReply,
  safeReply
};
