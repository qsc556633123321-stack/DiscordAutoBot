const { EmbedBuilder } = require('discord.js');

const LIMIT = 3900;
function chunks(lines) {
  const pages = []; let current = '';
  for (const line of lines) { const next = current ? `${current}\n${line}` : line; if (next.length > LIMIT && current) { pages.push(current); current = line.slice(0, LIMIT); } else current = next.slice(0, LIMIT); }
  if (current) pages.push(current); return pages.length ? pages : ['None'];
}
function treeLines(nodes, depth = 0) { return nodes.flatMap((node) => [`${'  '.repeat(depth)}${node.type === 'category' ? '▾' : '•'} ${node.displayName}`, ...treeLines(node.children, depth + 1)]); }
function actionLine(action) { return `• ${action.resourceId || action.targetKey || 'resource'} — ${action.reason}${action.targetKey ? ` → ${action.targetKey}` : ''}`; }
function sectionPages(title, actions, empty = 'None') { return chunks(actions.length ? actions.map(actionLine) : [empty]).map((description, index) => new EmbedBuilder().setColor(title.includes('DELETE') ? 0xed4245 : 0x5865f2).setTitle(index ? `${title} (${index + 1})` : title).setDescription(description)); }

function renderServerGovernancePreview(preview = {}) {
  const summary = preview.summary || {};
  const totals = summary.totals || {};
  const pages = [new EmbedBuilder().setColor(0x5865f2).setTitle('SERVER GOVERNANCE PREVIEW').setDescription([
    `Current Resources: ${totals.currentResources || 0}`, `Desired Resources: ${totals.desiredResources || 0}`,
    `KEEP: ${summary.keep || 0} | CREATE: ${summary.create || 0} | MOVE: ${summary.move || 0} | RENAME: ${summary.rename || 0}`,
    `PERMISSION CHANGE: ${summary.permissionChange || 0} | SAFE DELETE: ${summary.safeDelete || 0} | REVIEW DELETE: ${summary.reviewDelete || 0}`,
    `REVIEW: ${summary.review || 0} | CONFLICT: ${summary.conflict || 0} | PROTECTED: ${summary.protected || 0}`
  ].join('\n'))];
  const actions = preview.plan?.actions || [];
  const group = (name) => actions.filter((action) => action.action === name);
  pages.push(...sectionPages('SAFE DELETE — verified replacement evidence', group('SAFE_DELETE')));
  pages.push(...sectionPages('REVIEW DELETE — manual decision required', group('REVIEW_DELETE')));
  pages.push(...sectionPages('CONFLICT — no mutation permitted', group('CONFLICT')));
  pages.push(...sectionPages('CREATE / MOVE / RENAME / PERMISSION CHANGE', actions.filter((action) => ['CREATE', 'MOVE', 'RENAME', 'PERMISSION_CHANGE'].includes(action.action))));
  pages.push(...chunks(treeLines(preview.projectedTree || [])).map((description, index) => new EmbedBuilder().setColor(0x57f287).setTitle(index ? `FINAL EXPECTED SERVER TREE (${index + 1})` : 'FINAL EXPECTED SERVER TREE').setDescription(description)));
  return Object.freeze(pages.map((embed) => Object.freeze({ embeds: [embed] })));
}
module.exports = { renderServerGovernancePreview };
