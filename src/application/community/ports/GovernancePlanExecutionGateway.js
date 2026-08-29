function assertGovernancePlanExecutionGateway(gateway) {
  for (const method of ['readInventory', 'readResourceState', 'createCategory', 'createChannel', 'moveResource', 'renameResource', 'updatePermissions', 'deleteChannel', 'deleteCategory']) if (typeof gateway?.[method] !== 'function') throw new TypeError(`GovernancePlanExecutionGateway requires ${method}`);
  return gateway;
}
module.exports = { assertGovernancePlanExecutionGateway };
