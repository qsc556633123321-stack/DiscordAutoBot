# Community Mutation Runtime Boundary

The legacy boundary is `src/systems/communityConcierge.js`. It directly owns Discord.js guild/channel/message operations and filesystem JSON writes. Existing Application/Domain read contracts supply only payload content; they do not own mutation decisions, persistence, or Discord writes.

No mutation port, repository, adapter, composition feature, or new runtime wrapper is introduced by this preparation slice. Discord, persistence, and JSON remain inside the legacy runtime owner.
