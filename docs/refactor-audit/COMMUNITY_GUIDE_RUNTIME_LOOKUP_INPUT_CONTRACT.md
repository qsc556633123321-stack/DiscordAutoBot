# Community Guide Runtime Lookup Input Contract

A future runtime call may only have this shape:

```js
lookupPort.lookup({ messageId: guideMessageId });
```

It must not pass Guild, Channel, Message, persistence data, or other runtime objects. The already-created per-invocation Pair owns the ensured channel. Truthy IDs, including malformed values, pass through unchanged.
