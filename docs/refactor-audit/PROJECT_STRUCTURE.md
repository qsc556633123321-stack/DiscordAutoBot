# Project Structure Audit

Generated: 2026-07-22

## Root Structure

```text
D:\Coding\DiscordautoBot
├─ apps/
├─ docs/
├─ node_modules/              # generated dependency install, ignored
├─ scripts/
├─ src/
├─ supabase/
├─ .env                       # local secrets, not inspected
├─ .env.example
├─ .gitignore
├─ dependency-graph.json      # generated architecture report artifact
├─ package-lock.json
├─ package.json
├─ Procfile
├─ railway.json
└─ README.md
```

## Package Scripts

```text
start                  node src/index.js
deploy                 node src/deploy-commands.js
dashboard:api          node apps/api/server.js
dashboard:web          next dev apps/web -p 3000
dashboard:dev          next dev apps/web -p 3000
api:dev                nodemon apps/api/server.js
dev                    concurrently "npm run api:dev" "npm run dashboard:dev"
dashboard:build        next build apps/web
dashboard:start        node apps/api/start-production.js
test:architecture      node scripts/test-architecture.js
test:permissions       node scripts/test-permissions.js
audit:commands         node scripts/audit-commands.js
audit:dead-code        node scripts/audit-dead-code.js
report:commands        node scripts/report-command-count.js
analyze:dependencies   node scripts/analyze-dependency-graph.js
report:complexity      node scripts/report-complexity.js
quality:gate           npm run analyze:dependencies && npm run test:architecture && npm run test:permissions && npm run audit:dead-code && npm run report:commands && npm run report:complexity
```

The project currently does not provide root `test`, `lint`, `typecheck`, or `build` scripts. It does provide focused architecture, permission, audit, complexity, and dashboard build scripts.

## Entry Points

- Discord bot runtime: `src/index.js`
- Slash command deployment: `src/deploy-commands.js`
- Dashboard API: `apps/api/server.js`
- Dashboard web app: `apps/web/app`
- Production dashboard launcher: `apps/api/start-production.js`

## Discord Bot Startup Flow

1. `npm start` runs `node src/index.js`.
2. `src/index.js` loads environment variables with `dotenv`.
3. A Discord.js v14 `Client` is created with guild, message, member, and voice intents.
4. Commands are loaded from `src/modules/commands/commandRegistry.js`.
5. Event entrypoints are loaded from `src/events`.
6. Legacy event hooks are also loaded from `src/legacy/events`.
7. The client logs in with the configured Discord bot token.

Slash command deployment uses `src/deploy-commands.js`, which reads the same command registry and deploys through Discord REST.

## Folder Responsibilities

- `apps/api`: Express API for the dashboard, OAuth/session handling, mock/live dashboard data, and SQLite MVP data.
- `apps/web`: Next.js App Router dashboard with React UI components and Tailwind styling.
- `scripts`: local architecture tests, dependency graph generation, command audit, dead-code audit, and complexity reports.
- `supabase`: PostgreSQL schema for future/optional Supabase deployment.
- `src/commands`: seven main slash command group entrypoints.
- `src/events`: six primary Discord event entrypoints.
- `src/modules`: routers and extracted modules for commands, interactions, layout, and voice event coordination.
- `src/services`: service facades and orchestration surfaces for community, games, security, and voice.
- `src/domain`: policy and identity logic that should stay independent from Discord API and file IO.
- `src/infrastructure`: Discord repositories/writers and storage primitives.
- `src/systems`: compatibility facades and active systems that have not all been migrated into services.
- `src/legacy`: quarantined legacy commands, runtime implementations, and compatibility paths.
- `src/data`: JSON runtime state and registries used by bot systems.
- `src/core`: shared primitives such as result pattern, event bus, logger, and constants.
- `src/utils`: shared utility helpers.

## Dependency Flow

Intended architecture:

```text
commands / events
  -> modules / services
    -> domain policies
    -> infrastructure repositories/writers
      -> Discord API / JSON storage
```

Current compatibility flow still includes controlled legacy paths:

```text
commands / events
  -> modules / services
    -> adapters/legacy or systems wrappers
      -> src/legacy runtimes
```

The dependency graph report currently shows circular dependencies at 0 and architecture score at 100/100. However, legacy compatibility is still a major migration risk because several active services intentionally import legacy runtimes through `fallbackAllowed` paths.

## Runtime Technology

- JavaScript/CommonJS is the dominant runtime style.
- No TypeScript source files were found in the project source tree.
- Discord bot uses Node.js and Discord.js v14.
- Dashboard API uses Express, Passport Discord OAuth, sessions, CORS, and SQLite.
- Dashboard frontend uses Next.js App Router, React, Tailwind CSS, and lucide icons.
- Supabase is represented by SQL schema files, not a generated client in this audit.

