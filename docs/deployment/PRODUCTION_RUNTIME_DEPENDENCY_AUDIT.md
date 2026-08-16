# Production Runtime Dependency Audit

Base: `70ff72a` on `main`. This is a repository audit, not a Vultr inspection.

## Bot Runtime

- Entry: `src/index.js`.
- Start command: `npm start` (`node src/index.js`).
- Install command: `npm ci`, using committed `package-lock.json` lockfile v3.
- Required packages: `discord.js`, `dotenv`; `openai` is installed but the
  Concierge contract treats its key as optional.
- Node: package engines require `>=18.0.0`; installed `discord.js` also
  declares `>=18`. Use an actively supported Node release on the server.

## Dashboard Runtime

- Separate entry: `npm run dashboard:start` (`apps/api/start-production.js`).
- Web build: `npm run dashboard:build`; Next declares Node `>=20.9.0`.
- Dashboard packages include Express, Next, cookie-parser, CORS, and optional
  Supabase support.
- Do not infer that the dashboard is part of the current Vultr bot service;
  the deployment mechanism is unknown from the repository.

## Install Result

`npm ci` completed against the committed lockfile. npm reported existing
dependency advisories; they were not changed in this preparation slice and
must be triaged before exposing the dashboard publicly.

## Conclusion

`npm ci` is sufficient to reproduce repository dependencies. Server Node
version and whether the Dashboard is deployed are manual-audit requirements.
