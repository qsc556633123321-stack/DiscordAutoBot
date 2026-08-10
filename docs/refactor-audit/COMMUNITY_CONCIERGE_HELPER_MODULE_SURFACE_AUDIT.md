# Community Concierge Helper Module Surface Audit

`module.exports` exposes constants, builders, button handling, welcome delivery,
and setup functions. It does not export `readOnboardingData` or
`saveOnboarding`, directly, nested, by alias, spread, or property assignment.

Both helpers are private local implementation details, not public module API.
