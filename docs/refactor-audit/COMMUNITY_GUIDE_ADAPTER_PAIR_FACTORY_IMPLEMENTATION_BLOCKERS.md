# Guide Adapter Pair Factory Implementation Blockers

The production stateless pair factory is implemented at
`src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js`.
It is not wired into Composition or runtime. Runtime failure handoff,
persistence ordering, Roadmap continuation, and rollback remain blockers for a
runtime redirect.
