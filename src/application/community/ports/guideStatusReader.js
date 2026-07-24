function assertGuideStatusReader(reader) {
  if (!reader || typeof reader.readGuideStatus !== 'function') {
    throw new TypeError('guideStatusReader.readGuideStatus is required');
  }
  return reader;
}

module.exports = { assertGuideStatusReader };
