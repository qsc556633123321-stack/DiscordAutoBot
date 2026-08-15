# Community Concierge Button Matcher Collision Audit

Before this slice, no modern button family matched `concierge_`; the only active
prefix owner was the legacy interaction runtime. Existing role, game, voice,
panel, and admin matchers use disjoint exact IDs or prefixes.

After migration, exactly one matcher owns the family:
`communityConciergeButtons.matches(customId)`, which requires a string and
uses `customId.startsWith('concierge_')`. The legacy Concierge branch was
removed. Known and unknown Concierge IDs therefore stop at the same family
boundary and cannot fall through into another button family or legacy fallback.
