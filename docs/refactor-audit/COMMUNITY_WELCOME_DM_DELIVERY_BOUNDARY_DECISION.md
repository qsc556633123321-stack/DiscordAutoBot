# Community Welcome DM Delivery Boundary Decision

## Recommended Boundary
`createCommunityWelcomeDmDeliveryAdapter({ member })` in Infrastructure.

It returns `Object.freeze({ send })`, where `async send(payload)` returns `member.send(payload).catch(() => null)`.

## Contract
- Factory validates `typeof member?.send === 'function'` at construction and throws `TypeError('CommunityWelcomeDmDeliveryAdapter requires member.send')` otherwise.
- `member` and `payload` are passed through exactly, with no lookup, clone, normalization, or serialization.
- Success exposes the raw send result; failure exposes `null`. Future runtime may continue ignoring that result and therefore retain its `undefined` return.
- No retry, logging, payload building, channel resolution, tracking, reader, filesystem, Application Port, or Composition feature.

## Lifetime
Per invocation/per delivery, constructed after payload construction and immediately before sending. This mirrors the live-member lifetime and avoids retaining member references.
