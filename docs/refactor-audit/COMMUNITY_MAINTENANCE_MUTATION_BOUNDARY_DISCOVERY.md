# Community Maintenance Mutation Boundary Discovery

Maintenance includes permission repair, layout repair, dedupe, cleanup, rebuild, factory reset, stale channel/category cleanup, and the protected `channelDelete.js` event. These paths combine diagnostics, confirmation UI, plan persistence, destructive actions, and server logs.

Destructive actions require authorization, confirmation, protected-resource checks, bounded delete counts, and recovery evidence. `channelDelete.js` remains an active event hook and is intentionally unchanged. Maintenance is not a candidate until read-only diagnostics and destructive execution can be separated.
