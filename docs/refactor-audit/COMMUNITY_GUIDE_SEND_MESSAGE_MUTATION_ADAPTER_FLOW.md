# Send Mutation Adapter Flow

Port send delegates to Session, receives raw S, then returns application-safe
`SendSuccess` with only `messageId`. Raw S is discarded at the adapter boundary.
