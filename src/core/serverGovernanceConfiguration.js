function getServerGovernanceConfiguration(environment = process.env) {
  return Object.freeze({
    governanceEnabled: environment?.SERVER_GOVERNANCE_ENABLED === 'true',
    executionEnabled: environment?.SERVER_GOVERNANCE_EXECUTION_ENABLED === 'true'
  });
}

module.exports = { getServerGovernanceConfiguration };
