# Roadmap Lookup Message Identity

When fetch returns `M`, runtime stores that exact object in `message` and calls
`M.edit(payload)`. It neither wraps, clones, nor refetches `M`.
