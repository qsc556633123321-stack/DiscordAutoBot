# Guide Discord Execution Helper Decision

Keep inline legacy `message.edit()` and `channel.send()` calls. A thin helper
would not remove Discord object leakage or establish a stable test seam, while
it would add an unapproved runtime layer. Thin Helper: Rejected.
