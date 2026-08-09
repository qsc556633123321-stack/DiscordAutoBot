# Roadmap Reuse Feature Implementation Necessity

A production reuse feature is required before a runtime redirect. It prevents
the future runtime from knowing generic `{ guildId, patch }` shape while still
reusing the established generic writer boundary. It must not be a writer,
repository, Port, filesystem adapter, or runtime integration.
