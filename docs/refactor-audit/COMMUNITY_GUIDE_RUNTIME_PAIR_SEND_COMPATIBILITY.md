# Guide Runtime Pair Send Compatibility

When tracked-message lookup is unavailable, Pair Creation-only would create
one Pair but make zero port calls. Legacy still performs one fetch and one
send without another channel resolution.
