# Guide Execution Boundary After Persistence Migration

```text
GuidePublicationMutationPlan (Application, branch decision)
  -> legacy communityConcierge resolves message/channel resources
  -> legacy message.edit(payload) or channel.send(payload)
  -> saveOnboarding()
  -> persistence use case / repository port / filesystem adapter
  -> legacy Roadmap continuation and interaction behavior
```

## Ownership

| Responsibility | Owner |
| --- | --- |
| Edit/Send decision | Application Plan, consumed by legacy runtime |
| Message lookup and send destination | Legacy `communityConcierge` |
| Discord edit/send | Legacy `communityConcierge` |
| Publication record merge workflow | Application use case |
| Filesystem writer | Infrastructure adapter |
| Dependency wiring | Composition |
| Roadmap runtime | Legacy `communityConcierge` |

The persistence boundary is independent after a successful edit/send, but the
Discord mutation boundary remains coupled to channel ensure, message lookup,
payload, partial failure, and Roadmap continuation.
