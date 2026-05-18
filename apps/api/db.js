let createClient = null;

try {
  ({ createClient } = require('@supabase/supabase-js'));
} catch (error) {
  createClient = null;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasValidSupabaseUrl = /^https?:\/\//i.test(SUPABASE_URL || '');
const hasSupabase = Boolean(hasValidSupabaseUrl && SUPABASE_SERVICE_ROLE_KEY && createClient);
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

const memory = {
  sessions: new Map(),
  panelDrafts: new Map(),
  aiSuggestions: new Map()
};

function assertSupabasePackage() {
  if (hasValidSupabaseUrl && SUPABASE_SERVICE_ROLE_KEY && !createClient) {
    throw new Error('Missing @supabase/supabase-js. Run: npm install @supabase/supabase-js');
  }
}

function panelKey(guildId, channelId) {
  return `${guildId}:${channelId}`;
}

async function createSession(session) {
  assertSupabasePackage();

  if (!supabase) {
    memory.sessions.set(session.id, session);
    return session;
  }

  const { error } = await supabase.from('dashboard_sessions').insert({
    id: session.id,
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: session.expiresAt,
    user_json: session.user,
    created_at: session.createdAt,
    updated_at: session.updatedAt
  });
  if (error) throw error;
  return session;
}

async function getSession(id) {
  assertSupabasePackage();
  if (!id) return null;

  if (!supabase) {
    return memory.sessions.get(id) || null;
  }

  const { data, error } = await supabase
    .from('dashboard_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    user: data.user_json
  };
}

async function deleteSession(id) {
  assertSupabasePackage();
  if (!id) return;

  if (!supabase) {
    memory.sessions.delete(id);
    return;
  }

  const { error } = await supabase.from('dashboard_sessions').delete().eq('id', id);
  if (error) throw error;
}

async function getPanelDraft(guildId, channelId) {
  assertSupabasePackage();

  if (!supabase) {
    return memory.panelDrafts.get(panelKey(guildId, channelId)) || null;
  }

  const { data, error } = await supabase
    .from('panel_drafts')
    .select('*')
    .eq('guild_id', guildId)
    .eq('channel_id', channelId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertPanelDraft(guildId, channelId, draft) {
  assertSupabasePackage();
  const now = new Date().toISOString();
  const row = {
    guild_id: guildId,
    channel_id: channelId,
    panel_type: draft.panelType || 'custom',
    title: draft.title || '',
    content: draft.content || '',
    color: draft.color || '#5865F2',
    buttons: draft.buttons || '',
    footer: draft.footer || '',
    image: draft.image || '',
    message_id: draft.messageId || null,
    updated_at: now
  };

  if (!supabase) {
    memory.panelDrafts.set(panelKey(guildId, channelId), row);
    return row;
  }

  const { data, error } = await supabase
    .from('panel_drafts')
    .upsert(row, { onConflict: 'guild_id,channel_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function listAiSuggestions(guildId) {
  assertSupabasePackage();

  if (!supabase) {
    return memory.aiSuggestions.get(guildId) || [];
  }

  const { data, error } = await supabase
    .from('ai_cleanup_suggestions')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

module.exports = {
  createSession,
  deleteSession,
  getPanelDraft,
  getSession,
  listAiSuggestions,
  upsertPanelDraft
};
