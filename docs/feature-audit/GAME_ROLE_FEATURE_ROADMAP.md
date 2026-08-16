# Game Role Feature Roadmap

## Current Status

Slice #1 is FOUNDATION: canonical logical identities, inheritance, pure access
decisions, registry integration, tests, and permission feasibility are
implemented without Discord mutation.

## Approved Sequence

1. Slice #2: Game Role Provisioning. Create or resolve only the logical
   game:<id> Discord roles with rollback and duplicate safeguards.
2. Slice #3: Game Role Selection UI. Add selection and removal flows after
   roles exist.
3. Slice #4: Game Category Permission Wiring. Apply per-game access only after
   production permission characterization.
4. Slice #5: Existing Guild Permission Migration. Reconcile existing roles and
   categories with an explicit preview and approval path.

## Next Decision

Recommend Slice #2: Game Role Provisioning. Roles must exist before UI and
permission wiring can safely reference their stable identities.
