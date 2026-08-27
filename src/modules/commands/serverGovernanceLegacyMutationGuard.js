const {
  BLOCK_WHEN_GOVERNANCE_ENABLED,
  assertLegacyGuildMutationAllowed
} = require('../../application/community/serverGovernanceLegacyMutationPolicy');

async function replyBlockedLegacyMutation(interaction, message) {
  const payload = { content: message, ephemeral: true };
  if (interaction.replied || interaction.deferred) return interaction.editReply(payload);
  return interaction.reply(payload);
}

function createGovernanceGuardedLegacyCommand(command, { environment = process.env } = {}) {
  const operation = command?.data?.name;
  if (!operation || !BLOCK_WHEN_GOVERNANCE_ENABLED.has(operation)) return command;
  return Object.freeze({
    ...command,
    governanceMutationGuarded: true,
    async execute(interaction) {
      const decision = assertLegacyGuildMutationAllowed(operation, { environment });
      if (!decision.allowed) return replyBlockedLegacyMutation(interaction, decision.message);
      return command.execute(interaction);
    }
  });
}

async function guardLegacyMutationInteraction(interaction, operation, { environment = process.env } = {}) {
  if (!operation) return false;
  const decision = assertLegacyGuildMutationAllowed(operation, { environment });
  if (decision.allowed) return false;
  await replyBlockedLegacyMutation(interaction, decision.message);
  return true;
}

module.exports = {
  createGovernanceGuardedLegacyCommand,
  guardLegacyMutationInteraction,
  replyBlockedLegacyMutation
};
