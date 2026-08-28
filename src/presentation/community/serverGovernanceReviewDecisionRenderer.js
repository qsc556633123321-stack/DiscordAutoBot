function renderReviewSummary(review = {}) {
  const counts = review.resolvedPlan?.counts || {};
  return [
    'SERVER GOVERNANCE REVIEW DECISIONS',
    `Undecided: ${counts.UNDECIDED || 0} | Keep: ${counts.KEEP || 0} | Delete: ${counts.DELETE || 0}`,
    `Adopt canonical: ${counts.ADOPT_CANONICAL || 0} | Ignored: ${counts.IGNORE_GOVERNANCE || 0} | Stale: ${counts.STALE || 0}`,
    `Orphaned: ${counts.ORPHANED_DECISION || 0} | Blockers: ${review.resolvedPlan?.blockers?.length || 0}`,
    `Status: ${review.resolvedPlan?.status || 'BLOCKED_REVIEW_DECISIONS'}`
  ].join('\n');
}

function matches(entry, filter) {
  if (!filter || filter === 'all') return true;
  if (filter === 'undecided' || filter === 'stale') return entry.decisionState === filter.toUpperCase();
  if (filter === 'review-delete') return entry.action === 'REVIEW_DELETE';
  if (filter === 'unknown') return entry.ownership === 'USER_MANAGED' || entry.purpose === 'unknown';
  if (filter === 'game') return String(entry.resolvedCanonicalIdentity || entry.parentName || '').includes('game');
  if (filter === 'category' || filter === 'channel') return filter === 'category' ? entry.resourceType === 'category' : entry.resourceType !== 'category';
  return false;
}

function renderReviewEntries(manifest = {}, { filter = 'all', page = 1, pageSize = 10 } = {}) {
  const entries = (manifest.entries || []).filter((entry) => matches(entry, filter));
  const start = Math.max(0, (page - 1) * pageSize);
  const visible = entries.slice(start, start + pageSize);
  return `${visible.map((entry) => `• ${entry.resourceName} (${entry.resourceId})\n  ${entry.resourceType} | ${entry.decisionState} | ${entry.recommendedAction}\n  ${entry.reason}`).join('\n') || 'No matching review items.'}\n\nPage ${page}/${Math.max(1, Math.ceil(entries.length / pageSize))} | ${entries.length} items`;
}

function renderReviewItem(entry) {
  if (!entry) return 'Review item not found.';
  return [`${entry.resourceName} (${entry.resourceId})`, `Type: ${entry.resourceType} | Parent: ${entry.parentName || 'None'} (${entry.parentId || 'None'})`, `Reason: ${entry.reason}`, `Evidence: ${(entry.evidence || []).join(', ') || 'None'}`, `Recommendation: ${entry.recommendedAction}`, `Decision: ${entry.decisionState}`, `Canonical target: ${entry.canonicalTargetKey || 'None'}`].join('\n');
}

module.exports = { renderReviewEntries, renderReviewItem, renderReviewSummary };
