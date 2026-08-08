# Guide Discord Mutation Guild Resolution

`guildId` is required by the Application Port even though the current Guide
channel is already obtained from a Guild. Its future value is resource context,
consistency/audit input, and a stable lookup key. This slice does not decide
whether a future adapter must resolve Guild separately before channel lookup.

No fallback Guild, cache policy, normalization, or consistency repair is
approved. Missing/rejected Guild lookup is a candidate `ChannelLookupFailed` or
`Unknown` mapping only after adapter implementation characterization.
