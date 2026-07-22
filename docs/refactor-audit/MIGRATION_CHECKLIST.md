# Legacy Migration Checklist

## Before Migration

- [ ] Find static references.
- [ ] Check command aliases and dynamic command registry loading.
- [ ] Check legacy event loading.
- [ ] Check interaction fallback routes and custom-ID families.
- [ ] Define behavior fixtures and regression tests.
- [ ] Identify the application use case.
- [ ] Identify pure domain rules.
- [ ] Identify infrastructure dependencies and compatibility gateways.

## During Migration

- [ ] Create the new service/use-case path.
- [ ] Create a presentation adapter.
- [ ] Preserve the legacy command/event/system file as a thin wrapper.
- [ ] Keep command names, options, permissions, and response payloads identical.
- [ ] Compare legacy-baseline and migrated output for the same input.
- [ ] Add a rollback note to the migration report.

## Verification

- [ ] Run focused regression tests.
- [ ] Run `npm run quality:gate`.
- [ ] Run `npm run dashboard:build`.
- [ ] Confirm no command deploy list changed.
- [ ] Confirm runtime fallback behavior is unchanged unless explicitly tested.

## After Migration

- [ ] Mark the legacy file `Migrated; Wrapper Remaining`.
- [ ] Update `LEGACY_INVENTORY.md`.
- [ ] Update `LEGACY_BURN_DOWN_PLAN.md`.
- [ ] Keep the legacy implementation through its release-window review.
