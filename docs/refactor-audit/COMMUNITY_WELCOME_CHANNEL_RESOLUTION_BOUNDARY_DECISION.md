# Community Welcome Channel Resolution Boundary Decision

## Recommended boundary

Use a narrow Infrastructure-facing resolver, conceptually:

```js
createCommunityWelcomeChannelResolver({ guild, findChannelByName })
  .resolve({ trackedChannelId, fallbackChannelName })
```

It returns the exact Discord Channel object, `null`, or the exact fallback
channel object. It is not an Application Port: the operation fundamentally
requires a live Guild and preserves Discord object identity.

## Rejected alternatives

- Application Port carrying a Guild/Member: violates the layer boundary.
- `guildId`-only Port: requires an unapproved resource registry/composition root.
- Existing channel reader reuse: only partial and contract-incompatible.
- Keeping direct Runtime resolution: not selected for the next preparation because the flow is bounded and characterized.
