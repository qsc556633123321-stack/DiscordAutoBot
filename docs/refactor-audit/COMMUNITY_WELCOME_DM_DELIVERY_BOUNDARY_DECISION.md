# Community Welcome DM Delivery Boundary Decision

## Recommended boundary

Use a narrow Infrastructure-style adapter, conceptually:

```js
createCommunityWelcomeDmDeliveryAdapter({ member }).send(payload)
```

The adapter awaits exactly one `member.send(payload)` and swallows a rejection to
`null`. It does not retry, log, transform payload, or return a Discord message.

No Application Port or Composition feature is approved: both would expose a
Discord Member above Infrastructure without reducing the bounded Runtime work.
