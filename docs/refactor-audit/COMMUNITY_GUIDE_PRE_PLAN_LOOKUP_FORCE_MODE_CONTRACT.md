# Community Guide Pre-Plan Lookup Force Mode Contract

When `options.mode === 'force'`, the legacy runtime performs exactly zero
tracked-message lookups even if the tracked ID is valid or malformed. It sets
availability false through the absence of `message`, creates a Send plan, and
does not search history, repair identity, or find a fallback message/channel.
