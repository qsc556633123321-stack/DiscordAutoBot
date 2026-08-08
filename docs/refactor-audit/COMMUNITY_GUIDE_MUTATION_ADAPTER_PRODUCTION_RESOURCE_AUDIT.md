# Guide Mutation Adapter Production Resource Audit

`GuidePublicationResourceSession` is at
`src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js`.
Its factory accepts `{ ensuredChannel }`. `lookupTrackedMessage(messageId)`
calls the ensured channel's `messages.fetch` once and retains the exact returned
Message. `editTrackedMessage(payload)` edits that retained Message.
`sendMessage(payload)` sends on the same ensured Channel.

The lookup adapter accepts the same session, maps lookup rejection to
`MessageUnavailable`, and exposes no raw resource. Neither adapter is wired to
composition or legacy runtime.
