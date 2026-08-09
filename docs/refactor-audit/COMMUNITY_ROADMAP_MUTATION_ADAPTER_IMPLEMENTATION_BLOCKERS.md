# Community Roadmap Mutation Adapter Implementation Blockers

The production Roadmap mutation adapter is implemented only as an isolated
infrastructure mapping over the existing Resource Session and Application Port.

It is not exposed through the Adapter Pair, Composition, or runtime. It does
not own persistence sequencing, retry, rollback, raw Discord resources, or
failure diagnostics. Those responsibilities remain blocked until separately
characterized slices are approved.
