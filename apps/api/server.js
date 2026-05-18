require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');
const next = require('next');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./db');
const {
  ensureBot,
  getBotStatus,
  getGuildChannels,
  getGuildRoles,
  getGuildStructure,
  getManageableGuilds,
  previewAutoOrganize,
  publishPanel,
  sendAnnouncement
} = require('./discord');

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 4000;
const WEB_URL = process.env.DASHBOARD_WEB_URL || 'http://localhost:3000';
const API_URL = process.env.DASHBOARD_API_URL || `http://localhost:${PORT}`;
const SESSION_COOKIE = 'dcos_session';
const SERVE_WEB = process.env.DASHBOARD_SERVE_WEB === 'true';

app.use(cors({ origin: WEB_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(process.env.SESSION_SECRET || 'dev_secret'));

function getSessionId(req) {
  return req.signedCookies[SESSION_COOKIE] || req.cookies[SESSION_COOKIE] || null;
}

async function createSession({ accessToken, refreshToken, expiresIn, user }) {
  const now = new Date().toISOString();
  const session = {
    id: crypto.randomUUID(),
    accessToken,
    refreshToken,
    expiresAt: Date.now() + (Number(expiresIn) || 604800) * 1000,
    user,
    createdAt: now,
    updatedAt: now
  };
  await db.createSession(session);
  return session.id;
}

async function requireSession(req, res, nextMiddleware) {
  try {
    const session = await db.getSession(getSessionId(req));
    if (!session || (session.expiresAt && Number(session.expiresAt) < Date.now())) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }
    req.session = session;
    nextMiddleware();
  } catch (error) {
    nextMiddleware(error);
  }
}

function asyncRoute(handler) {
  return (req, res, nextMiddleware) => {
    Promise.resolve(handler(req, res)).catch(nextMiddleware);
  };
}

function safeJson(handler, fallback) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`Dashboard API route failed ${req.method} ${req.path}:`, error);
      res.json({
        ok: false,
        error: error.message || 'internal_error',
        ...fallback
      });
    }
  };
}

function getDashboardGuildId(req) {
  return req.query.guildId || req.params.guildId || null;
}

app.get('/health', asyncRoute(async (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
}));

app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || `${API_URL}/auth/discord/callback`,
    response_type: 'code',
    scope: 'identify guilds'
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

app.get('/auth/discord/callback', asyncRoute(async (req, res) => {
  const body = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || `${API_URL}/auth/discord/callback`
  });

  const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!tokenResponse.ok) throw new Error(`OAuth token failed ${tokenResponse.status}`);
  const token = await tokenResponse.json();

  const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  if (!userResponse.ok) throw new Error(`Discord user fetch failed ${userResponse.status}`);
  const user = await userResponse.json();
  const sessionId = await createSession({
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresIn: token.expires_in,
    user
  });

  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.redirect(`${WEB_URL}/dashboard`);
}));

app.post('/auth/logout', asyncRoute(async (req, res) => {
  await db.deleteSession(getSessionId(req));
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
}));

app.get('/api/me', requireSession, (req, res) => {
  try {
    res.json({ ok: true, user: req.session.user || null });
  } catch (error) {
    res.json({ ok: false, error: error.message, user: null });
  }
});

app.get('/api/guilds', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, guilds: await getManageableGuilds(req.session.accessToken) });
}, { guilds: [] }));

app.get('/api/dashboard', requireSession, safeJson(async (req, res) => {
  const guildId = getDashboardGuildId(req);
  const [bot, guild, suggestions] = await Promise.all([
    getBotStatus().catch((error) => ({ ready: false, guilds: 0, tag: null, error: error.message })),
    guildId ? getGuildStructure(guildId).catch(() => null) : Promise.resolve(null),
    guildId ? db.listAiSuggestions(guildId).catch(() => []) : Promise.resolve([])
  ]);
  res.json({ ok: true, bot, guild, aiSuggestions: suggestions });
}, { bot: { ready: false, guilds: 0 }, guild: null, aiSuggestions: [] }));

app.get('/api/channels', requireSession, safeJson(async (req, res) => {
  const guildId = getDashboardGuildId(req);
  if (!guildId) {
    res.json({ ok: true, categories: [], uncategorized: [] });
    return;
  }
  res.json({ ok: true, ...(await getGuildChannels(guildId)) });
}, { categories: [], uncategorized: [] }));

app.get('/api/roles', requireSession, safeJson(async (req, res) => {
  const guildId = getDashboardGuildId(req);
  res.json({ ok: true, roles: guildId ? await getGuildRoles(guildId) : [] });
}, { roles: [] }));

app.get('/api/panels', requireSession, safeJson(async (req, res) => {
  const guildId = getDashboardGuildId(req);
  const channelId = req.query.channelId;
  if (!guildId || !channelId) {
    res.json({ ok: true, panels: [], draft: null });
    return;
  }
  res.json({ ok: true, draft: await db.getPanelDraft(guildId, channelId) });
}, { panels: [], draft: null }));

app.get('/api/ai-organize-preview', requireSession, safeJson(async (req, res) => {
  const guildId = getDashboardGuildId(req);
  if (!guildId) {
    res.json({ ok: true, plan: { moves: [], manualReview: [] }, suggestions: [] });
    return;
  }
  const [plan, suggestions] = await Promise.all([
    previewAutoOrganize(guildId).catch(() => ({ moves: [], manualReview: [] })),
    db.listAiSuggestions(guildId).catch(() => [])
  ]);
  res.json({ ok: true, plan, suggestions });
}, { plan: { moves: [], manualReview: [] }, suggestions: [] }));

app.get('/api/tickets', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, tickets: [] });
}, { tickets: [] }));

app.get('/api/logs', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, logs: [] });
}, { logs: [] }));

app.get('/api/guilds/:guildId', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, guild: await getGuildStructure(req.params.guildId) });
}, { guild: null }));

app.get('/api/guilds/:guildId/channels', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, ...(await getGuildChannels(req.params.guildId)) });
}, { categories: [], uncategorized: [] }));

app.get('/api/guilds/:guildId/roles', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, roles: await getGuildRoles(req.params.guildId) });
}, { roles: [] }));

app.get('/api/bot/status', safeJson(async (req, res) => {
  res.json({ ok: true, ...(await getBotStatus()) });
}, { ready: false, tag: null, guilds: 0, uptime: 0 }));

app.get('/api/guilds/:guildId/panels/:channelId', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, draft: await db.getPanelDraft(req.params.guildId, req.params.channelId) });
}, { draft: null }));

app.put('/api/guilds/:guildId/panels/:channelId', requireSession, safeJson(async (req, res) => {
  const draft = await db.upsertPanelDraft(req.params.guildId, req.params.channelId, req.body);
  res.json({ ok: true, draft });
}, { draft: null }));

app.post('/api/guilds/:guildId/panels/:channelId/publish', requireSession, safeJson(async (req, res) => {
  const existing = await db.getPanelDraft(req.params.guildId, req.params.channelId);
  const message = await publishPanel(req.params.guildId, req.params.channelId, {
    ...existing,
    ...req.body,
    messageId: existing?.message_id || existing?.messageId
  });
  const draft = await db.upsertPanelDraft(req.params.guildId, req.params.channelId, {
    ...req.body,
    messageId: message.id
  });
  res.json({ ok: true, messageId: message.id, draft });
}, { messageId: null, draft: null }));

app.post('/api/guilds/:guildId/announcements', requireSession, safeJson(async (req, res) => {
  const message = await sendAnnouncement(req.params.guildId, req.body.channelId, {
    title: req.body.title || '公告',
    message: req.body.message || ''
  });
  res.json({ ok: true, messageId: message.id });
}, { messageId: null }));

app.get('/api/guilds/:guildId/ai-suggestions', requireSession, safeJson(async (req, res) => {
  const suggestions = await db.listAiSuggestions(req.params.guildId);
  res.json({ ok: true, suggestions });
}, { suggestions: [] }));

app.post('/api/guilds/:guildId/auto-organize', requireSession, safeJson(async (req, res) => {
  res.json({ ok: true, previewOnly: true, plan: await previewAutoOrganize(req.params.guildId) });
}, { previewOnly: true, plan: { moves: [], manualReview: [] } }));

app.use((error, req, res, nextMiddleware) => {
  console.error('Dashboard API error:', error);
  res.status(500).json({ ok: false, error: error.message || 'internal_error' });
});

async function start() {
  if (SERVE_WEB) {
    const web = next({ dev: false, dir: 'apps/web' });
    const handle = web.getRequestHandler();
    await web.prepare();
    app.all(/.*/, (req, res) => handle(req, res));
  }

  app.listen(PORT, () => {
    console.log(`Dashboard API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Dashboard API failed to start:', error);
  process.exit(1);
});
