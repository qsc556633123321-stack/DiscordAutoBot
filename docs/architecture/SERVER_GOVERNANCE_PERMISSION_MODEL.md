# Server Governance Permission Model

Permission reconciliation is derived from canonical resource access profiles.
It produces semantic role-key directives in the Domain; Infrastructure resolves
those keys to exact Discord roles and writes overwrites.

- Public entry/read-only: `@everyone` can view; read-only denies sending.
- Member discussion: `@everyone` is denied and `member` is allowed.
- Game center: `@everyone` is denied and `game` is allowed.
- Specific game: `@everyone` and the generic game role receive no access;
  only `game:<gameId>` and administration roles are allowed.
- Voice entry: the specific game role receives view/connect/speak.
- Admin and bot-internal: only owner/admin/mod role keys are allowed.

Categories are the default permission owner. Child overrides are emitted only
for profiles that need an explicit difference from category inheritance.
