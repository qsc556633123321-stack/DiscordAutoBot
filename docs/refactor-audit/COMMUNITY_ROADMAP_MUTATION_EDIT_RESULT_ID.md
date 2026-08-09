# Community Roadmap Mutation Edit Result Identity

Legacy Edit targets retained message `M` and runtime keeps original `M`, even
when `M.edit(payload)` resolves a different object. A future `EditSuccess`
result must report `messageId: M.id`; it must never derive identity from the
resolved edit value.
