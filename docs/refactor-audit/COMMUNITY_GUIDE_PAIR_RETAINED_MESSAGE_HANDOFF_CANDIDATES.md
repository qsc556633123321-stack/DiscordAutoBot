# Community Guide Pair Retained Message Handoff Candidates

| Candidate | Decision | Reason |
| --- | --- | --- |
| A. Pair `getRetainedMessage()` | Preferred later | Narrow, synchronous, per-pair delegate; no second fetch. |
| B. `resource: { getRetainedMessage }` | Reject | Expands the public resource surface. |
| C. `getMessageResource()` | Reject | Leaks an extensible object boundary. |
| D. Expose Session | Reject | Leaks infrastructure and Discord-adjacent resources. |
| E. Lookup Adapter getter | Reject | Blurs lookup-port contract. |
| F. Composition getter | Reject | Lets raw Message cross composition state. |
| G. Runtime direct Session import | Reject | Bypasses Pair ownership. |
| H. Keep legacy forever | Not selected | Preserves behavior but cannot support a later no-second-fetch handoff. |

Candidate A is only a test-only preparation candidate in this slice.
