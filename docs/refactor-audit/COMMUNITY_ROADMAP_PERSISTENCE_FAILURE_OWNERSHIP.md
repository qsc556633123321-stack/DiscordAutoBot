# Community Roadmap Persistence Failure Ownership

The filesystem adapter catches and logs write failure, returning
`persisted: false`. `saveOnboarding` returns the record and
`setupRoadmapPanel` does not inspect the status, so a Discord Edit/Send can
succeed while persistence fails. The runtime does not retry or roll back.

A future Port may expose a result, but moving swallowing to runtime would
change ownership. Any migration must preserve logging, call count, partial
success, and exact Message return before changing that boundary.
