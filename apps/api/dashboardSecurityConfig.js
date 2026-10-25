function getCookieSigningSecret(env = process.env) {
  const secret = env.SESSION_SECRET;

  if (env.NODE_ENV === 'production' && (!secret || secret === 'dev_secret')) {
    throw new Error('SESSION_SECRET is required for the production Dashboard API');
  }

  return secret || 'dev_secret';
}

function dashboardWritesEnabled(env = process.env) {
  return env.DASHBOARD_WRITE_ENABLED === 'true';
}

module.exports = { dashboardWritesEnabled, getCookieSigningSecret };
