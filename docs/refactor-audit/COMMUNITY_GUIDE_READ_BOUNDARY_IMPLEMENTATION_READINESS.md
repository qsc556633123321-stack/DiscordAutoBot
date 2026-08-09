# Community Guide Read Boundary Implementation Readiness

## Recommendation

**Candidate B: Shared Publication Tracking State Read Boundary Preparation**

The next minimal slice should prepare a shared semantic query, provisionally named `CommunityPublicationTrackingReadPort`, rather than a Guide-only content/read feature. Its future request should be limited to:

```js
{ guildId, publication: 'guide' | 'roadmap' }
```

Its future result should be an Application-safe envelope such as:

```js
{ trackedMessageId }
```

The result must not expose the raw guild record, normalize `guildId`, normalize the tracked ID, add Discord objects, or add persistence behavior. It must preserve the existing mapper-plus-raw-fallback semantics and exactly one underlying read.

| Candidate | Result |
| --- | --- |
| A. Guide Read Application Contract Implementation | Not recommended; a Guide-only abstraction would duplicate Roadmap's same concern. |
| B. Shared Publication State Read Boundary Preparation | **Recommended next**. |
| C. Shared Publication State Read Boundary Implementation | Deferred until the port contract is frozen. |
| D. Guide Runtime Read Redirect Preparation | Deferred until a shared boundary exists. |
| E. Guide Runtime Read Redirect Implementation | Rejected for now; runtime redirect would be premature. |
| F. Keep Legacy | Rejected; the dependency is bounded and has a safe preparation path. |

`saveOnboarding` cleanup remains deferred. It has zero runtime consumers, but removing it is unrelated to the active shared read boundary and needs a separate cleanup decision.
