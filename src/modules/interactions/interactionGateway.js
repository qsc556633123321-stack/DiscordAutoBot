const { handleAutocompleteInteraction } = require('./autocompleteInteractionHandler');
const { handleButtonInteraction } = require('./buttonInteractionHandler');
const { handleInteractionError } = require('./interactionErrorHandler');
const { handleModalInteraction } = require('./modalInteractionHandler');
const { handleSelectMenuInteraction } = require('./selectMenuInteractionHandler');
const { handleSlashInteraction } = require('./slashInteractionHandler');

async function handle(interaction) {
  try {
    if (interaction.isAutocomplete?.()) return handleAutocompleteInteraction(interaction);
    if (interaction.isChatInputCommand?.()) return handleSlashInteraction(interaction);
    if (interaction.isModalSubmit?.()) return handleModalInteraction(interaction);
    if (interaction.isStringSelectMenu?.()) return handleSelectMenuInteraction(interaction);
    if (interaction.isButton?.()) return handleButtonInteraction(interaction);
    return null;
  } catch (error) {
    return handleInteractionError(interaction, error);
  }
}

module.exports = { handle };
