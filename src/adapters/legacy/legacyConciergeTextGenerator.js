const { generateConciergeText } = require('../../systems/communityConcierge');

function createLegacyConciergeTextGenerator({ generator = generateConciergeText } = {}) {
  return {
    generate(kind, context, fallback) {
      return generator(kind, context, fallback);
    }
  };
}

module.exports = { createLegacyConciergeTextGenerator };
