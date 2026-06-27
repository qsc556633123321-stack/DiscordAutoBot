# Discord Community OS Bot

Discord.js v14 community management bot for the 科幻基地 Discord server.

The project is now on **Project Architecture V2**:

- Command Router is complete.
- Main command surface is consolidated to 7 command groups plus 65 legacy aliases.
- Circular dependencies are currently 0.
- Active Architecture Score is 84 / 100.
- Previous baseline before legacy-score separation was 76 / 100.
- Legacy code is still present and tracked through a staged burn-down plan.

## Install

```bash
npm install
```

Create `.env`:

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
OPENAI_API_KEY=
```

## Run

```bash
npm run deploy
npm start
```

Dashboard:

```bash
npm run api:dev
npm run dashboard:dev
```

## Main Commands

- `/community`
- `/game`
- `/voice`
- `/security`
- `/panel`
- `/admin`
- `/dev`

Legacy slash commands remain deployed as aliases while the codebase is burned down behind the new router.

## Architecture Checks

```bash
npm run analyze:dependencies
npm run report:complexity
npm run test:architecture
npm run audit:dead-code
npm run report:commands
```

## Docs

- [Project Architecture V2](docs/ARCHITECTURE.md)
- [Dependency Graph](docs/DEPENDENCY_GRAPH.md)
- [Legacy Burn Down](docs/LEGACY_BURN_DOWN.md)
- [Commands](docs/COMMANDS.md)
- [Community Architecture V3](docs/COMMUNITY_V3.md)
- [Permissions](docs/PERMISSIONS.md)
- [Game Registry](docs/GAME_REGISTRY.md)
- [Security](docs/SECURITY.md)
- [Voice System](docs/VOICE_SYSTEM.md)
- [Operations](docs/OPERATIONS.md)
- [Refactor Audit](docs/REFACTOR_AUDIT.md)
