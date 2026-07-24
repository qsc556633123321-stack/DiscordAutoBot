function assertConciergeTextGenerator(generator) {
  if (!generator || typeof generator.generate !== 'function') {
    throw new Error('Concierge text generator is required.');
  }
}

module.exports = { assertConciergeTextGenerator };
