# Community Welcome Channel Read Implementation Necessity

- Existing message Port modification: **Not required**.
- New Application Port: **Required**.
- New Infrastructure compatibility Adapter: **Required**.
- Composition feature: **Not required**; the existing runtime construction
  convention can create a stateless adapter per invocation after a separate
  redirect preparation.
- Runtime redirect: **Not approved in this slice**.

The future adapter must call the approved compatibility reader exactly once,
select `records[guildId] || {}`, and return the direct raw `guideChannelId` in
a frozen semantic result. It must not own Discord lookup, sending, or writes.
