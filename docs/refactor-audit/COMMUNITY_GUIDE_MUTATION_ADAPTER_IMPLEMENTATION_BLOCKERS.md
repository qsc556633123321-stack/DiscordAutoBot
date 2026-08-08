# Guide Production Mutation Adapter Implementation Blockers

The production adapter now exists at
`src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js`.
It is deliberately not wired. No runtime entry creates a session or imports the
adapter, and no composition feature pairs the lookup and mutation adapters.

The next approved investigation is per-invocation adapter-pair composition
preparation. Runtime redirects remain blocked by ordering, persistence, Roadmap
continuation, and rollback requirements.
