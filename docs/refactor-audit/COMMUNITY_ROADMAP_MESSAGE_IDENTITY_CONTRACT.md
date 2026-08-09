# Roadmap Message Identity Contract

Edit: fetch returns exact message `M`; runtime calls `M.edit(payload)`,
persists `M.id`, and returns `M`.

Send: `channel.send(payload)` returns exact message `S`; runtime persists
`S.id` and returns `S`. No post-send fetch occurs. This is characterized for
future migration only and is not shared with the Guide identity handoff.
