# Community Roadmap Runtime Feature Lifetime

The approved future construction shape is a module-level immutable feature:

```js
const communityRoadmapAdapterPairFeature =
  createCommunityRoadmapAdapterPairFeature();
```

The feature holds only the factory dependency. It does not create, retain, or
reuse a Pair. Each `setupRoadmapPanel(guild)` invocation must create exactly one
fresh Pair after the Roadmap channel has been ensured. Repeated calls, including
calls for the same channel, must receive distinct Pair instances.

External injection is test-only. Constructing the feature, Pair, session, and
adapter must not perform Discord I/O.
