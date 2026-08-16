const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const application = fs.readFileSync(path.join(root, 'src', 'application', 'games', 'gameRoleProvisioningUseCase.js'), 'utf8');
const infrastructure = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'discord', 'discordGameRoleProvisioningGateway.js'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'systemRuntimes', 'roleManagerRuntime.js'), 'utf8');
const ready = fs.readFileSync(path.join(root, 'src', 'events', 'ready.js'), 'utf8');

assert.equal(application.includes('discord.js'), false);
assert.equal(application.includes('PermissionFlagsBits'), false);
assert.equal(infrastructure.includes('gameRegistry'), false);
assert.equal(legacy.includes('game:valorant'), false);
assert.equal((legacy.match(/game:/g) || []).length, 0);
assert.equal(ready.includes('provisionGameRoles'), false);
console.log('Game role provisioning architecture boundary test passed.');
