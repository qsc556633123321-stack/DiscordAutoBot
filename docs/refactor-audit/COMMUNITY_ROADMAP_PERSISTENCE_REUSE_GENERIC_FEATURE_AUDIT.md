# Roadmap Reuse: Generic Feature Audit

`createCommunityPublicationStateFeature` is the generic composition factory.
It accepts either an injected repository or adapter dependencies, creates the
generic filesystem adapter when needed, and exposes exactly:

```js
{ persistCommunityPublicationRecord: useCase }
```

The exact invocation path is
`feature.persistCommunityPublicationRecord.execute({ guildId, patch })`. It is
synchronous and returns the generic adapter result unchanged. The use case and
adapter retain validation, `updatedAt`, merge, write, logging, and
`{ persisted, record }` ownership. The generic feature is the only approved
dependency surface for a future Roadmap reuse feature.
