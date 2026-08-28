const assert = require('node:assert/strict');
const { renderServerGovernancePreview } = require('../../../src/presentation/community/serverGovernancePreviewRenderer');
const actions = Array.from({ length: 80 }, (_, index) => ({ action: index % 2 ? 'SAFE_DELETE' : 'REVIEW_DELETE', resourceId: `resource-${index}`, targetKey: 'category:entry', reason: 'verified_replacement' }));
const reviewManifest = {
  entries: [{ resourceId: 'legacy-1', resourceName: '聊天', resourceType: 'text', parentName: '英雄聯盟', parentId: 'parent-1', resolvedCanonicalIdentity: null, purpose: 'unknown', ownership: 'MANAGED_CANONICAL', lifecycle: 'deprecated', reason: 'legacy_split_compact_game_layout_requires_review', recommendedAction: 'MIGRATE', approvalState: 'UNDECIDED', action: 'REVIEW_DELETE' }],
  byReason: { legacy_split_compact_game_layout_requires_review: 1 },
  byResourceType: { text: 1 }
};
const pages = renderServerGovernancePreview({ summary: { safeDelete: 40, reviewDelete: 40, totals: { currentResources: 80, desiredResources: 1 } }, plan: { actions }, reviewManifest, projectedTree: [{ displayName: 'ENTRY', type: 'category', children: [{ displayName: 'welcome', type: 'text', children: [] }] }] });
assert.equal(pages.length > 3, true);
assert.equal(pages.some((page) => page.embeds[0].data.title.includes('SAFE DELETE')), true);
assert.equal(pages.some((page) => page.embeds[0].data.title.includes('REVIEW DELETE')), true);
assert.equal(pages.some((page) => page.embeds[0].data.title.includes('REVIEW SUMMARY BY REASON')), true);
const reviewPage = pages.find((page) => page.embeds[0].data.title.includes('REVIEW DELETE'));
assert.equal(reviewPage.embeds[0].data.description.includes('英雄聯盟 / 聊天'), true);
assert.equal(reviewPage.embeds[0].data.description.includes('Parent ID: parent-1'), true);
assert.equal(reviewPage.embeds[0].data.description.includes('Recommendation: MIGRATE'), true);
assert.equal(pages.every((page) => page.embeds[0].data.description.length <= 3900), true);
console.log('Server governance preview renderer tests passed.');
