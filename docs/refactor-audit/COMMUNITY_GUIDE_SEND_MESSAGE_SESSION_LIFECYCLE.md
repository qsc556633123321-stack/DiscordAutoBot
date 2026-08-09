# Send Session Lifecycle

Current `sendMessage(payload)` calls the exact ensured Channel once and returns
its raw Message, but does not retain it. A successful future send may set the
current publication resource to that same Message; failure semantics are still
unapproved.
