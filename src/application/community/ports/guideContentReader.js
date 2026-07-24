function assertGuideContentReader(reader) {
  if (!reader || typeof reader.readGuideContent !== 'function') {
    throw new TypeError('guideContentReader.readGuideContent is required');
  }
  return reader;
}

module.exports = { assertGuideContentReader };
