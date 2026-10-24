const { ok, fail } = require('../../core/result');
function unavailable() { return fail('DATABASE_NOT_READY', 'Supabase governance schema is not configured'); }
function createSupabaseGovernanceReadRepositories({ client } = {}) {
  const list = async (table, guildId) => { if (!client) return unavailable(); try { const { data, error } = await client.from(table).select('*').eq('discord_guild_id', guildId); return error ? fail(error.code === '42P01' ? 'DATABASE_NOT_READY' : 'DATABASE_QUERY_FAILED', 'Governance database query failed', { code: error.code || null }) : ok(Object.freeze(data || [])); } catch (error) { return fail('DATABASE_QUERY_FAILED', 'Governance database query failed', { code: error?.code || null }); } };
  return Object.freeze({ planRepository: Object.freeze({ listPlans: ({ guildId }) => list('cleanup_plans', guildId) }), decisionRepository: Object.freeze({ listDecisions: ({ guildId }) => list('suggestion_reviews', guildId) }), auditRepository: Object.freeze({ listAudit: ({ guildId }) => list('audit_logs', guildId) }) });
}
module.exports = { createSupabaseGovernanceReadRepositories };
