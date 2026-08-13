# Community Welcome Unrelated Owner Exclusion

`maybeAddRole`, `handleConciergeButton`, `generateConciergeText`, and channel
setup helpers remain in `communityConcierge.js`, but none participates in
`sendConciergeWelcome`. They are separate role, interaction, AI, and setup
responsibilities. Their migration is required for Community-wide closure, not
for Welcome delivery closure.
