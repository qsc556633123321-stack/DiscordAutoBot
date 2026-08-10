# Community Tracking Read Runtime Construction Decision

## Decision

**Use direct per-invocation construction inside each future runtime entry.**

```js
const trackingReadPort = createCommunityPublicationTrackingReadCompatibilityAdapter({
  readOnboardingData
});
const request = createCommunityPublicationTrackingReadRequest({
  guildId: guild.id,
  publication: 'guide' // or 'roadmap'
});
const { trackedMessageId } = trackingReadPort.readTrackedMessage(request);
```

## Candidate Comparison

| Candidate | Decision | Reason |
| --- | --- | --- |
| A. Runtime direct per-invocation construction | **Recommended** | Matches the existing per-invocation Guide/Roadmap adapter-pair lifetime, keeps injection local, and adds no state. |
| B. Module-level adapter instance | Rejected | Adapter is stateless, but module lifetime is a broader behavior change with no benefit. |
| C. Composition feature | Rejected | The boundary needs only the legacy reader already in runtime scope; a feature adds indirection without a new ownership need. |
| D. Parameter injection into setup functions | Rejected | Changes public runtime signatures and expands the slice. |
| E. Higher composition root | Rejected | No existing root owns this legacy reader; it would create unnecessary wiring. |

## Shared Instance Semantics

Guide and Roadmap do not share one instance across invocations. Each invocation
creates one stateless adapter. The adapter has no cache, mutable guild state,
Discord resource, persistence capability, or retained result.

## Validation and Failure

Runtime must construct the request with the official constructor. It supplies
constant, supported discriminators, so unsupported-publication errors are not a
new reachable normal runtime path. The injected reader retains its existing
absorbed missing-file, malformed-JSON, and read-error fallback behavior.
