const { MAX_MOVES_PER_PLAN } = require('../application/organizer/createOrganizerPlanningUseCase');
const { createOrganizerFeature } = require('../composition/organizerFeature');

const organizerFeature = createOrganizerFeature();
const pendingOrganizePlans = new Map();

function formatPlanItem(item, index) {
  return `${index + 1}. #${item.channelName}\n` +
    `目前：${item.currentCategoryName}\n` +
    `建議：${item.suggestedCategoryName}\n` +
    `分數：${item.score}（差距 ${item.scoreGap}）\n` +
    `信心：${item.confidence}\n` +
    `原因：${item.reason}`;
}

function formatMovePreview(plan) {
  return plan.moves.length ? plan.moves.map(formatPlanItem).join('\n\n') : '沒有找到可自動搬移的頻道。';
}

function formatManualReview(plan) {
  return plan.manualReview.length ? plan.manualReview.map(formatPlanItem).join('\n\n') : '無';
}

module.exports = {
  MAX_MOVES_PER_PLAN,
  createOrganizePlan: organizerFeature.createPlan,
  deleteOrganizePlan: (id) => pendingOrganizePlans.delete(id),
  formatManualReview,
  formatMovePreview,
  getAIReviewInput: organizerFeature.getAIReviewInput,
  getOrganizePlan: (id) => pendingOrganizePlans.get(id),
  pendingOrganizePlans,
  saveOrganizePlan: (id, plan) => pendingOrganizePlans.set(id, plan),
  scoreChannelName: organizerFeature.scoreChannelName
};
