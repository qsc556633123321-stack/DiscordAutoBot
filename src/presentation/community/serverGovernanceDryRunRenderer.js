const { EmbedBuilder } = require('discord.js');
function renderServerGovernanceDryRun(result = {}) {
  const summary = result.summary || {};
  const preflight = result.preflight || {};
  return Object.freeze({ embeds: [new EmbedBuilder().setColor(preflight.ok ? 0x57f287 : 0xfaa61a).setTitle('SERVER GOVERNANCE DRY RUN').setDescription([
    `Mode: ${result.mode || 'dry_run'}`,
    `Preflight: ${preflight.ok ? 'PASS' : 'BLOCKED'}`,
    `Reasons: ${(preflight.reasons || []).join(', ') || 'None'}`,
    `Create: ${summary.created || 0} | Move: ${summary.moved || 0} | Rename: ${summary.renamed || 0}`,
    `Permissions: ${summary.permissionChanged || 0} | Delete channels: ${summary.deletedChannels || 0} | Delete categories: ${summary.deletedCategories || 0}`,
    'Discord writes: 0'
  ].join('\n'))] });
}
module.exports = { renderServerGovernanceDryRun };
