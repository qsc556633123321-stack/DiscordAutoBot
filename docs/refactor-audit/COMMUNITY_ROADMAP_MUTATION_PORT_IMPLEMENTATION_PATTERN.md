# Community Roadmap Mutation Port Implementation Pattern

`RoadmapPublicationMessageMutationPort` follows the Roadmap lookup-port style:
one CommonJS module with immutable scalar request/result factories and a narrow
port assertion. It is Roadmap-specific and does not reuse Guide modules.

The envelope is frozen; `messageId` and opaque `payload` are preserved exactly.
There is intentionally no failure result or raw Discord resource exposure.
