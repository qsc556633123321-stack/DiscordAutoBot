# Community Guide Pair Retained Message Handoff Implementation Blockers

## Slice Scope
The Pair Factory now exposes a narrow synchronous `getRetainedMessage()`
delegate. It does not redirect runtime lookup or mutation.

## Remaining Blockers
- `communityConcierge.js` still owns legacy tracked-message fetch, edit, send,
  failure handling, and Roadmap continuation.
- A runtime lookup redirect needs its own refreshed characterization against the
  now-public Pair capability.
- Runtime mutation redirect remains a separate high-risk decision.

## Explicit Non-Changes
No Session exposure, resource object, cache, registry, second fetch, retry,
normalization, persistence change, Composition change, or Application change.
