function assertGuildChannelReader(reader) {
  if (!reader || typeof reader.listTextChannels !== 'function') {
    throw new Error('Guild channel reader is required.');
  }
}

module.exports = { assertGuildChannelReader };
