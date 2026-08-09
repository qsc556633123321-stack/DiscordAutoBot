# Roadmap Lookup Result Discriminator

The application contract exports `RoadmapPublicationMessageLookupKind` with
the exact values `Available` and `Unavailable`. A future runtime implementation
must import that constant and compare `lookupResult.kind` to
`RoadmapPublicationMessageLookupKind.Available`; it must not introduce a magic
string or inspect infrastructure session results.

`Available` maps to the Pair retained message. `Unavailable` maps to `null`
and therefore preserves the legacy send branch.
