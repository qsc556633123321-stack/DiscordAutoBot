# Community Concierge Button Resolver Input Contract

Future API: `resolveCommunityConciergeButtonAction(customId)`.

- Input is a raw customId value, not an interaction, guild, or member.
- Exact supported strings return the six frozen semantic actions.
- `undefined`, `null`, empty string, numbers, booleans, objects, arrays,
  unknown concierge IDs, and non-concierge strings return `null`.
- Matching is exact and case-sensitive. It does not trim, normalize, coerce,
  use prefix matching, or use regular expressions.
- The resolver neither throws for these values nor performs Discord, reply,
  role, persistence, or logging work.

Legacy prefix filtering remains separate: only the legacy dispatcher decides
whether a non-concierge customId reaches the Concierge handler.
