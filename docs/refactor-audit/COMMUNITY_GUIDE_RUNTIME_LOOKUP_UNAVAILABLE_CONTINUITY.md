# Community Guide Runtime Lookup Unavailable Continuity

Unavailable and all adapter-caught failures map to legacy-equivalent `null`: the mutation plan chooses Send, legacy `channel.send(payload)` remains the only mutation, and persistence/Roadmap order is unchanged. Expected lookup/fetch count is one for a truthy ID; expected mutation-port count is zero.
