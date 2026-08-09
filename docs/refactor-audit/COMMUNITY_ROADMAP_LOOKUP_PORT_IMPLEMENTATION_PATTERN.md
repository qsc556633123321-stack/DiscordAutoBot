# Community Roadmap Lookup Port Implementation Pattern

`RoadmapPublicationMessageLookupPort` is a pure CommonJS application contract.
It exports frozen request/result factories and a frozen `kind` enum. Request
creation preserves `messageId` exactly, including all falsy and malformed
values. `Available` returns the exact value; `Unavailable` contains no reason,
error, Discord resource, or raw rejection.

The module performs no I/O and imports no Guide or infrastructure code. It is
not an adapter and does not invoke the Roadmap Resource Session.
