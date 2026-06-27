const ACTION_TYPES = Object.freeze({
  KEEP: 'keep',
  RENAME: 'rename',
  MOVE: 'move',
  DELETE: 'delete',
  DELETE_CANDIDATE: 'delete_candidate',
  REPAIR_PERMISSION: 'repair_permission'
});

const RISK_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
});

module.exports = { ACTION_TYPES, RISK_LEVELS };
