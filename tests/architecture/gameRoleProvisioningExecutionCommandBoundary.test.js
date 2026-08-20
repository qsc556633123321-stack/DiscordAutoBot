const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getCommandRegistry } = require('../../src/modules/commands/commandRegistry');

const root = path.resolve(__dirname, '..', '..');
const command = fs.readFileSync(path.join(root, 'src', 'presentation', 'commands', 'gameRoleProvisioningExecutionCommand.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'src', 'presentation', 'games', 'gameRoleProvisioningExecutionRenderer.js'), 'utf8');
const legacyRoleManager = fs.readFileSync(path.join(root, 'src', 'legacy', 'systemRuntimes', 'roleManagerRuntime.js'), 'utf8');

assert.equal(command.includes("const CONFIRMATION = 'CREATE_GAME_ROLES'"), true);
assert.equal(command.includes('previewGameRoleProvisioning'), true);
assert.equal(command.includes('provisionGameRoles'), true);
assert.equal(/guild\.roles\.(create|delete)|role\.delete|member\.roles\.(add|remove)|permissionOverwrites/.test(command), false);
assert.equal(renderer.includes('guild.'), false);
assert.equal(renderer.includes('createRole'), false);
assert.equal(legacyRoleManager.includes('CREATE_GAME_ROLES'), false);
const admin = getCommandRegistry({ includeAliases: false }).get('admin').data.toJSON();
const provision = admin.options.find((option) => option.name === 'game-role-provision');
assert.ok(provision);
assert.equal(provision.options.find((option) => option.name === 'confirm').required, true);
assert.equal(getCommandRegistry().has('game-role-provision'), false);
assert.equal(getCommandRegistry({ includeAliases: false }).get('admin').data.toJSON().options.some((option) => option.name === 'game-role-preview'), true);
console.log('Game role execution command architecture boundary test passed.');
