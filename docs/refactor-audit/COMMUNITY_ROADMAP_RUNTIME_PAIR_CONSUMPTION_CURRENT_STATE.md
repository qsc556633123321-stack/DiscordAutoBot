# Community Roadmap Runtime Pair Consumption Current State

The runtime creates one Pair per `setupRoadmapPanel` invocation and destructures
only `lookupPort` and `getRetainedMessage`. The Pair already contains
`mutationPort`, but it has zero runtime uses. It must not be sourced from a
second Pair or a direct Adapter import.
