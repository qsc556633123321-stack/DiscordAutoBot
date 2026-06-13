async function edit(interaction, payload) {
  if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });
  return interaction.editReply(payload);
}

module.exports = { edit };
