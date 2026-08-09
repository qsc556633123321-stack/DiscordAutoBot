# Community Guide Pair Handoff Future Lookup Flow

Future-only forecast:

```text
ensure channel -> create Pair -> lookupPort.lookup(request)
  -> Session retains successful exact Message
  -> Pair.getRetainedMessage()
  -> existing legacy edit branch uses that identity
```

The proposed getter must not trigger another `messages.fetch`. Current production runtime is not redirected by this document.
