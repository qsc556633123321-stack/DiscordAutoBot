const assert = require('node:assert/strict');
const path = require('node:path');

const cases = require(path.resolve(__dirname, '../fixtures/community/community-guide-persistence-reuse-feature-cases.json'));
const required = [
  'guide-edit', 'guide-send', 'four-field-patch', 'single-execute', 'persisted-false',
  'invariant-error', 'invariant-string', 'invariant-number', 'invariant-object',
  'invariant-null', 'invariant-undefined', 'sync', 'no-promise', 'roadmap-coexistence',
  'welcome-preservation', 'unknown-preservation', 'other-guild', 'updatedAt', 'no-writer',
  'no-repository', 'no-port', 'no-discord', 'no-filesystem',
  'no-roadmap-semantic-coupling', 'runtime-legacy', 'roadmap-closure',
  'saveOnboarding-consumer', 'production-diff-zero'
];
assert.ok(cases.length >= 40);
for (const name of required) assert.ok(cases.includes(name), `Missing frozen reuse case: ${name}`);
console.log('Guide persistence reuse frozen fixture inventory is complete');
