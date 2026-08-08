# Guide Lookup Adapter Session Injection

The only approved candidate shape is
`createGuidePublicationMessageLookupDiscordAdapter({ session })`. Explicit
per-invocation injection preserves resource identity and testability. A getter,
global current-session registry, AsyncLocalStorage, composition singleton, and
adapter-created session are rejected due to global state, stale-resource, or
ensure-duplication risk.
