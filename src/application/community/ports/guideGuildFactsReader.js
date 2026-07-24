function assertGuideGuildFactsReader(reader) {
  if (!reader || typeof reader.readGuideGuildFacts !== 'function') {
    throw new TypeError('guideGuildFactsReader.readGuideGuildFacts is required');
  }
  return reader;
}

module.exports = { assertGuideGuildFactsReader };
