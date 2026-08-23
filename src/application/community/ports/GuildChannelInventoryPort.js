function assertGuildChannelInventoryPort(port) {
  if (typeof port?.readGuildInventory !== 'function') throw new TypeError('GuildChannelInventoryPort requires readGuildInventory');
  return port;
}
module.exports = { assertGuildChannelInventoryPort };
