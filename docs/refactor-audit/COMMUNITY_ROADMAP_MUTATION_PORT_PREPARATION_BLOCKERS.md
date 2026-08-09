# Community Roadmap Mutation Port Preparation Blockers

The current Roadmap runtime still owns `message.edit(payload)`,
`channel.send(payload)`, and the subsequent persistence call. No production
Mutation Port exists in this slice.

The unresolved implementation blockers are exact raw rejection handoff
(including `undefined`), opaque Discord-shaped payload ownership, and session
retention of original Edit message `M` versus exact Send message `S`.
