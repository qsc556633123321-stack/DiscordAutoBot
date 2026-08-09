# Roadmap Pair Consumption Shape

The per-invocation Composition feature already creates a Pair after the
Roadmap channel is ensured. The Pair exposes exactly:

```js
{ lookupPort, getRetainedMessage }
```

It is currently unused by `setupRoadmapPanel`. The approved future lookup-only
redirect will destructure this existing Pair in place. It does not need a new
factory, session, adapter, port, persistence writer, or mutation abstraction.
