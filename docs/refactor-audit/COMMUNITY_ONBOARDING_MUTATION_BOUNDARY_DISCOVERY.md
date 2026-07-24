# Community Onboarding Mutation Boundary Discovery

`guildMemberAdd` is an active event entry. It calls MemberGuard, Welcome, then Concierge welcome behavior. The aggregate path may create/add a guest role, send welcome messages, send DMs, schedule a reminder, and link a Guide channel. Failures are mostly logged or swallowed to keep the event alive.

Onboarding contains at least four separable concerns: read/recommendation, welcome message, initial role grant, and completion mutation. The current event is shared with MemberGuard and Roles, so it is high risk and not a candidate for a direct Community mutation migration.
