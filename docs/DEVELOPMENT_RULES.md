# Development Rules

This project uses Project Architecture V2 as the default development contract.

## Where New Code Goes

- Slash command declarations go in command files or the command router.
- Interaction routing goes in `src/modules/interactions`.
- Discord event files in `src/events` must only call a gateway module.
- Business workflows go in `src/services`.
- Pure rules and policy go in `src/domain`.
- Discord API writes go in `src/infrastructure/discord`.
- JSON persistence goes through `src/infrastructure/storage/jsonStore.js`.
- OpenAI calls go in `src/infrastructure/ai`.

## Responsibilities

- Commands parse options and dispatch to a service or router.
- Events are gateway entrypoints only.
- Services coordinate workflows and return results.
- Domain modules contain pure decisions and must not import services or infrastructure.
- Infrastructure modules are the only place that talks to Discord APIs, files, databases, or external APIs.

## Forbidden

- Commands must not create channels, edit permissions, write JSON, or contain business rules.
- Events must not contain long workflows.
- Services must not directly use `guild.channels.create`, `channel.setName`, `setParent`, `permissionOverwrites`, or raw `fs.readFileSync/writeFileSync`.
- Domain must not import infrastructure or services.
- Active files must not import `src/legacy` unless explicitly marked with `fallbackAllowed`.
- Active JS files must stay under 400 lines.
- Command files must stay under 150 lines.
- Event files must stay under 80 lines.

## Adding Discord Commands

1. Add the slash command shape to the command registry/router.
2. Keep the file limited to `SlashCommandBuilder`, option parsing, and dispatch.
3. Put behavior in a service.
4. Run the quality gate before committing.

## Adding Button, Modal, Or Select Handlers

1. Add a handler under `src/modules/interactions`.
2. Match by exact `customId` or a narrow prefix.
3. Keep Discord replies in responder helpers where possible.
4. Do not add business rules inside the gateway.

## Adding Storage

1. Create a small store module under `src/infrastructure/storage`.
2. Use `jsonStore.readJson`, `writeJsonAtomic`, or `updateJson`.
3. Never read or write `src/data/*.json` directly from commands or services.

## Adding OpenAI Features

1. Put the client call in `src/infrastructure/ai`.
2. Put prompt/result policy in domain or service.
3. AI suggestions must pass deterministic policy validation before execution.

## Avoiding Circular Dependencies

- Dependencies flow: command/event/router -> service -> domain -> repository/infrastructure.
- Domain never imports upward.
- Services do not call other services in long chains.
- Shared constants belong in `src/core` or domain policy.

## Required Pre-Commit Gate

Run:

```bash
npm run analyze:dependencies
npm run test:architecture
npm run test:permissions
npm run audit:dead-code
npm run report:complexity
```

Or run the combined gate:

```bash
npm run quality:gate
```
