# Community Welcome Channel Resolver Runtime Construction Decision

## Decision
Use a **per-invocation** resolver, constructed after the tracking read and immediately before resolution.

## Rationale
The resolver holds a live `guild` reference and is stateless. Per-invocation construction matches the existing per-invocation onboarding reader and tracking adapter lifetime, adds no shared cache or mutable state, and preserves the current reader/tracking read count of one.

## Rejected Options
- Module-level: would retain a live guild outside the invocation.
- Composition feature or higher root: adds a new layer without a required dependency boundary.
- Dependency injection: would alter the runtime signature and broaden the redirect.

## Frozen Future Request
```js
{
  trackedChannelId: guideChannelId,
  fallbackChannelName: GUIDE_CHANNEL_NAME
}
```
`guideChannelId` and `GUIDE_CHANNEL_NAME` are passed exactly, without coercion or normalization.
