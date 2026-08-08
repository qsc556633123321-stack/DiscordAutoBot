# Community Guide Channel Resource Lifecycle Audit

`setupCommunityGuide(guild)` calls `getOrCreateGuideChannel(guild)` once. Its
returned channel provides `id`, `messages.fetch`, `send`, and the returned
channel value. A fetched message is used for both `Boolean(message)` Plan input
and `message.edit(payload)`. Send uses the same ensured channel. Roadmap uses a
separate Roadmap channel flow. Ensure failure stops this Guide path before
payload/message work; legacy has no post-ensure channel re-resolution.
