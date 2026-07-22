# Legacy Command Migration Template

Copy this directory when migrating one legacy slash command. Keep the legacy command file as a thin wrapper until the replacement has passed its release window.

## Steps

1. Record the existing command name, options, default permissions, defer/reply behavior, and output payload.
2. Add an application use case for the workflow.
3. Extract pure decisions into `domain/`.
4. Put Discord, JSON, Supabase, or filesystem work behind `infrastructure/` gateways.
5. Put `SlashCommandBuilder` and interaction reply handling in `presentation/`.
6. Change only the legacy command implementation to re-export the presentation command.
7. Add a regression test that runs the legacy baseline and migrated path against identical fixtures.
8. Run the quality gate and Dashboard build. Keep a one-import rollback path.

## Directory Roles

- `application/`: workflow/use case.
- `domain/`: pure rules and value objects.
- `infrastructure/`: external API/storage gateways.
- `presentation/`: Discord command or interaction adapter.
- `tests/`: behavior-regression fixture.
