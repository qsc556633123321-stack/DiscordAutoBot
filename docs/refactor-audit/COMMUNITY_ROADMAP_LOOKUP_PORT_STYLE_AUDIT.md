# Community Roadmap Lookup Port Style Audit

## Decision

The future application contract is named `RoadmapPublicationMessageLookupPort`.
Its operation is `lookupTrackedMessage({ messageId })`.

## Rationale

- `RoadmapPublication` keeps ownership specific to the roadmap publication flow.
- `MessageLookup` states the sole responsibility without implying mutation.
- The application request contains only `{ messageId }`: the Roadmap Resource
  Session already owns the exact ensured channel for the invocation.
- Results use CommonJS factories and the existing `kind` discriminator:
  `{ kind: 'Available', messageId }` or `{ kind: 'Unavailable' }`.

The existing Guide lookup port is deliberately not reused. Its surrounding
identity and failure contracts belong to Guide publication, while roadmap fetch
rejections are swallowed as an unavailable lookup. A generic publication port
would hide this currently important semantic distinction.

No production port is implemented in this preparation slice.
