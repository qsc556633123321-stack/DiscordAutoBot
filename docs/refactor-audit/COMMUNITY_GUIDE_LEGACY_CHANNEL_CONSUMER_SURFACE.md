# Guide Legacy Channel Consumer Surface

After ensure, `setupCommunityGuide` requires `channel.id`,
`channel.messages.fetch`, and `channel.send`. `messages` and `fetch` are
required for the tracked-message branch; `send` is required for new-message
publication. Name, parent, type, and permission overwrites are consumed by
ensure, not by the publication branch after return.
