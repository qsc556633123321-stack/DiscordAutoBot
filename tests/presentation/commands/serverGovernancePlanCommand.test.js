const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { createServerGovernancePlanCommand } = require('../../../src/presentation/commands/serverGovernancePlanCommand');
function interaction(action, administrator = true) { const replies = []; return { guild: { id: 'guild', ownerId: 'owner' }, user: { id: 'admin' }, memberPermissions: { has: (permission) => administrator && permission === PermissionFlagsBits.Administrator }, options: { getString: () => action }, deferReply: async () => {}, editReply: async (value) => replies.push(value), replies }; }
const plan = { status: 'NO_CHANGES', planFingerprint: 'gov-plan', summary: {}, blockedReasons: [], operations: [] };
const feature = { serverGovernanceApprovedPlan: { compile: async () => ({ plan }), latest: () => ({ plan }), verify: async () => ({ status: 'VALID', blockers: [] }) } };
const command = createServerGovernancePlanCommand({ createFeature: () => feature });
command.execute(interaction('compile')).then(async () => { const denied = interaction('show', false); await command.execute(denied); assert.equal(String(denied.replies[0]).includes('Administrator'), true); assert.equal(command.data.name, 'server-governance-plan'); console.log('Server governance plan command tests passed.'); });
