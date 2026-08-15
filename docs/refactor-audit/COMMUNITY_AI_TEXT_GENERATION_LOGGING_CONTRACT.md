# Community AI Text Generation Logging Contract

Current logging contract: **none**.

`generateConciergeText` catches import, construction, request, and parser
failures silently and returns the caller fallback. It does not call
`console.warn`, `console.error`, project logger, Discord logs, or telemetry.
Any future migration must not add logs, prefixes, retries, or observable throws
without an explicitly approved behavior change.
