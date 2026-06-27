const runtime = require('./legacyInteractionRuntime');

module.exports = {
  ...runtime,
  async execute(interaction) {
    console.warn(`[LegacyFallback] interaction dispatcher used for ${interaction?.type || 'unknown'}:${interaction?.customId || interaction?.commandName || 'unknown'}`);
    return runtime.execute(interaction);
  }
};
