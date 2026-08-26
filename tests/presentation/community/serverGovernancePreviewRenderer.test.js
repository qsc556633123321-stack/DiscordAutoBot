const assert = require('node:assert/strict');
const { renderServerGovernancePreview } = require('../../../src/presentation/community/serverGovernancePreviewRenderer');
const actions = Array.from({ length: 80 }, (_, index) => ({ action: index % 2 ? 'SAFE_DELETE' : 'REVIEW_DELETE', resourceId: `resource-${index}`, targetKey: 'category:entry', reason: 'verified_replacement' }));
const pages = renderServerGovernancePreview({ summary: { safeDelete: 40, reviewDelete: 40, totals: { currentResources: 80, desiredResources: 1 } }, plan: { actions }, projectedTree: [{ displayName: 'ENTRY', type: 'category', children: [{ displayName: 'welcome', type: 'text', children: [] }] }] });
assert.equal(pages.length > 3, true);
assert.equal(pages.some((page) => page.embeds[0].data.title.includes('SAFE DELETE')), true);
assert.equal(pages.some((page) => page.embeds[0].data.title.includes('REVIEW DELETE')), true);
assert.equal(pages.every((page) => page.embeds[0].data.description.length <= 3900), true);
console.log('Server governance preview renderer tests passed.');
