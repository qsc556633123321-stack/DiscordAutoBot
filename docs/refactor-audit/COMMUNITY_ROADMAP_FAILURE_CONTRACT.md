# Roadmap Failure Contract

- Channel/category ensure failure rejects before publication.
- Stored-message fetch rejection is swallowed and proceeds to send.
- Edit/send rejection propagates the exact raw value; no persistence write.
- Persistence rejection occurs after Discord mutation, so the message may exist
  while its ID is untracked.

These rules apply to `Error` and non-Error values.
