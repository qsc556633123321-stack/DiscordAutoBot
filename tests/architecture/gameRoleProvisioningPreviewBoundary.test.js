const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const command = fs.readFileSync(path.join(root, 'src', 'presentation', 'commands', 'gameRoleProvisioningPreviewCommand.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'src', 'presentation', 'games', 'gameRoleProvisioningPreviewRenderer.js'), 'utf8');
const router = fs.readFileSync(path.join(root, 'src', 'modules', 'commands', 'commandRouter.js'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'src', 'modules', 'commands', 'aliasRegistry.js'), 'utf8');

assert.equal(command.includes('previewGameRoleProvisioning'), true);
assert.equal(command.includes('provisionGameRoles'), false);
assert.equal(/guild\.roles\.create|\.delete\(|member\.roles\.(add|remove)|permissionOverwrites/.test(command), false);
assert.equal(renderer.includes('guild.'), false);
assert.equal(renderer.includes('createRole'), false);
assert.equal(router.includes("'game-role-preview': { target: 'game-role-preview' }"), true);
assert.equal(registry.includes('ROUTE_ONLY_COMMANDS'), true);
assert.equal(registry.includes("'game-role-preview': '../../presentation/commands/gameRoleProvisioningPreviewCommand'"), true);
assert.equal(registry.includes("ACTIVE_COMMANDS = Object.freeze({\n  'game-role-preview'"), false);
console.log('Game role preview architecture boundary test passed.');
