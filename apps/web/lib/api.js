export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function fallbackFor(path, error) {
  const base = { ok: false, error };
  if (path === '/api/me') return { ...base, user: null };
  if (path === '/api/guilds') return { ...base, guilds: [] };
  if (/^\/api\/guilds\/[^/]+$/.test(path)) return { ...base, guild: null };
  if (path === '/api/dashboard') return { ...base, dashboard: null, bot: { ready: false, guilds: 0 }, guild: null, aiSuggestions: [] };
  if (path === '/api/channels' || path.includes('/channels')) return { ...base, categories: [], uncategorized: [] };
  if (path === '/api/roles' || path.includes('/roles')) return { ...base, roles: [] };
  if (path === '/api/panels' || path.includes('/panels')) return { ...base, panels: [], draft: null };
  if (path === '/api/ai-organize-preview' || path.includes('/ai-suggestions') || path.includes('/auto-organize')) {
    return { ...base, suggestions: [], plan: { moves: [], manualReview: [] } };
  }
  if (path === '/api/tickets') return { ...base, tickets: [] };
  if (path === '/api/logs') return { ...base, logs: [] };
  if (path === '/api/bot/status') return { ...base, ready: false, guilds: 0, tag: null };
  return base;
}

export async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      return fallbackFor(path, data.error || `API ${response.status}`);
    }

    return data;
  } catch (error) {
    return fallbackFor(path, error.message || 'API connection failed');
  }
}
