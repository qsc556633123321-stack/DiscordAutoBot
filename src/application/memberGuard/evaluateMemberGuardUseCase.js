const { evaluateMemberGuard } = require('../../domain/memberGuard/memberGuardPolicy');

function createEvaluateMemberGuardUseCase({ repository, clock = () => Date.now() } = {}) {
  if (!repository?.getSettings) throw new Error('MemberGuard repository with getSettings is required.');

  return {
    execute({ guildId, memberFacts }) {
      if (!guildId) throw new Error('guildId is required.');
      return evaluateMemberGuard(memberFacts || {}, repository.getSettings(guildId), clock());
    }
  };
}

module.exports = { createEvaluateMemberGuardUseCase };
