# Guide Lookup Message Lifecycle Audit

Legacy runtime fetches one exact Discord Message into local `message`; a rejection becomes `null`. Boolean availability selects Edit or Send, Edit receives that same `message`, persistence reads `message.id`, and `{ channel, message }` returns it. The production Session likewise fetches and privately retains the exact Message, exposes availability, and later uses it through `editTrackedMessage`. No current public handoff exposes the retained object.
