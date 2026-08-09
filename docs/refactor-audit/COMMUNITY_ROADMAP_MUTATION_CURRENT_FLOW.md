# Community Roadmap Mutation: Current Flow

`setupRoadmapPanel(guild)` completes lookup first, builds one payload object,
then performs exactly one legacy mutation.

- Available retained Message `M`: `await M.edit(payload)`; runtime keeps and
  returns `M`, even if `edit()` resolves to another object.
- Unavailable lookup: `message = await channel.send(payload)`; runtime keeps
  and returns the exact send result `S`.

After either successful Discord mutation, runtime calls `saveOnboarding` with
`message.id`, then returns `{ channel, message }`. Edit/Send failures propagate
their exact rejected value; there is no catch, fallback, or retry. Persistence
write failure is logged and swallowed by the existing writer, so the runtime
resolves after the Discord side effect. This slice does not change that
partial-success contract.
