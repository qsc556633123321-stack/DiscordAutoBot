const assert = require('node:assert/strict');
const {
  buildRoadmapViewModel,
  normalizeRoadmap,
  validateRoadmapShape
} = require('../../../src/domain/community/communityRoadmap');

const raw = {
  completed: ['First', 'Second'],
  inProgress: ['Current'],
  future: ['Future'],
  ignored: ['Unknown status']
};
const roadmap = normalizeRoadmap(raw);
const viewModel = buildRoadmapViewModel(raw);

assert.deepEqual(roadmap, { completed: ['First', 'Second'], inProgress: ['Current'], future: ['Future'] });
assert.deepEqual(viewModel.sections.map((section) => section.key), ['completed', 'inProgress', 'future']);
assert.deepEqual(viewModel.sections[0].items, ['First', 'Second']);
assert.equal(Object.hasOwn(viewModel, 'progress'), false);
assert.equal(Object.hasOwn(require('../../../src/domain/community/communityRoadmap'), 'calculateRoadmapProgress'), false);
assert.equal(validateRoadmapShape(null).valid, false);
assert.equal(validateRoadmapShape({ completed: [] }).valid, false);
assert.throws(() => normalizeRoadmap({ completed: [], inProgress: [], future: 'broken' }), /must be an array/);
assert.equal(Object.hasOwn(viewModel, 'timestamp'), false);
console.log('Community Roadmap domain tests passed.');
