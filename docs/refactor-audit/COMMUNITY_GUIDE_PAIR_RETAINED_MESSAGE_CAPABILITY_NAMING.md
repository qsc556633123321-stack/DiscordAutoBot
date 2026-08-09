# Community Guide Pair Retained Message Capability Naming

Candidates considered were `getRetainedMessage`, `getLookupMessage`,
`getTrackedMessage`, `getAvailableMessage`, and `peekRetainedMessage`. The only
approved future name is `getRetainedMessage` on the Pair:

```js
function getRetainedMessage() {
  return session.getRetainedMessage();
}
```

It describes a read-only retained identity, not a lookup, fetch, ownership
transfer, cache, Application contract, or generic session. It must remain
synchronous and must not accept arguments.
