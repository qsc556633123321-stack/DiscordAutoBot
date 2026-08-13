# Community Welcome DM Runtime Current Flow

`sendConciergeWelcome(member)` creates the onboarding reader, resolves the
tracked guide channel, returns immediately when no channel resolves, maps the
delivery request, and builds the payload. It then executes:

```js
await member.send(payload).catch(() => null);
```

The expression is awaited, but its resolved Message or `null` rejection result
is discarded. The async function consequently returns `undefined` in both
delivery outcomes. There is no retry or delivery-specific logging.
