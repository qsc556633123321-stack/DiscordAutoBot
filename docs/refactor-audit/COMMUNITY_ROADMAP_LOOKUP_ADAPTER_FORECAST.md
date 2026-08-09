# Community Roadmap Lookup Adapter Forecast

The future adapter will translate:

```text
lookupTrackedMessage({ messageId })
  -> session.lookupTrackedMessage(messageId)
  -> { kind: 'Available', messageId } | { kind: 'Unavailable' }
```

It will receive a per-invocation Roadmap Resource Session, perform no extra
fetch, and not reveal the retained raw Discord message. No production adapter,
composition wiring, or runtime redirect is added here.
