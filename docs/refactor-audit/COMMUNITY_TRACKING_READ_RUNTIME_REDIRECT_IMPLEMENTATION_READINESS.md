# Community Tracking Read Runtime Redirect Implementation Readiness

## Candidate Assessment

| Candidate | Decision |
| --- | --- |
| A. Combined Guide + Roadmap Runtime Redirect Implementation | **Approved next slice.** |
| B. Guide-only Implementation | Rejected; the shared semantics make a split unnecessary. |
| C. Roadmap-only Implementation | Rejected; the shared semantics make a split unnecessary. |
| D. Composition Implementation | Rejected; no composition feature is required. |
| E. Welcome Channel Read Preparation | Deferred; it is a distinct channel-ID boundary. |
| F. Keep Legacy | Rejected. |

## Preconditions Frozen

- Adapter is stateless and has no Discord, write, persistence, or cache state.
- Each candidate performs exactly one compatibility read.
- Guide preserves force-mode lookup skip; Roadmap preserves its truthy lookup.
- Falsy and truthy malformed tracked IDs preserve legacy lookup/send decisions.
- Reader failures remain absorbed by the existing reader and fall through to
  Send behavior.
- Welcome, `saveOnboarding`, persistence, and JSON remain out of scope.

## Next Slice Allowlist

`src/systems/communityConcierge.js` only, for the two tracked-message read
expressions and required imports. No other production file is approved.
