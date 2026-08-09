const assert = require('node:assert/strict');
const { isAllowedInfrastructureApplicationPortDependency } = require('../../scripts/analyze-dependency-graph');

const infrastructureAdapter = {
  type: 'infrastructure',
  file: 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js'
};

assert.equal(isAllowedInfrastructureApplicationPortDependency(infrastructureAdapter, {
  type: 'application',
  file: 'src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort.js'
}), true);
assert.equal(isAllowedInfrastructureApplicationPortDependency(infrastructureAdapter, {
  type: 'application',
  file: 'src/application/community/getCommunityRoadmapUseCase.js'
}), false);
assert.equal(isAllowedInfrastructureApplicationPortDependency(infrastructureAdapter, {
  type: 'application',
  file: 'src/application/community/communityPublicationService.js'
}), false);
assert.equal(isAllowedInfrastructureApplicationPortDependency(infrastructureAdapter, {
  type: 'presentation',
  file: 'src/presentation/community/communityRoadmapCommand.js'
}), false);
assert.equal(isAllowedInfrastructureApplicationPortDependency({
  type: 'domain',
  file: 'src/domain/community/communityRoadmap.js'
}, {
  type: 'infrastructure',
  file: 'src/infrastructure/community/communityRoadmapGateway.js'
}), false);
assert.equal(isAllowedInfrastructureApplicationPortDependency({
  type: 'application',
  file: 'src/application/community/getCommunityRoadmapUseCase.js'
}, {
  type: 'infrastructure',
  file: 'src/infrastructure/community/communityRoadmapGateway.js'
}), false);
console.log('Infrastructure-to-application Port dependency rule passed');
