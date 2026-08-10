# Community Publication Channel Tracking Read Decision

## Recommended: Candidate B, Separate Shared Channel Port

Create a future `CommunityPublicationChannelTrackingReadPort` with:

```js
readTrackedChannel({ guildId, publication: 'guide' })
// -> Object.freeze({ trackedChannelId })
```

It supports exact `'guide'` only initially and validates that discriminator in
the Application contract. `guildId` and `trackedChannelId` must be preserved
without coercion or normalization.

| Candidate | Decision |
| --- | --- |
| A. Extend message port | Rejected: mixes message and channel identity. |
| B. Separate shared channel port | Recommended: narrow semantic ownership. |
| C. Full tracking-state port | Rejected: returns more state than Welcome needs. |
| D. Welcome-specific port | Rejected: leaks presentation ownership into a shared data boundary. |
| E. Keep legacy | Deferred only until the approved implementation slice. |
