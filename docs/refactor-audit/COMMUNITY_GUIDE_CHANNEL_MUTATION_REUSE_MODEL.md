# Community Guide Channel Mutation Reuse Model

Send uses the ensured channel directly with no additional channel/message
lookup. Edit uses the one previously fetched message. Re-fetching the message
or re-resolving the channel after Plan risks double lookup, altered failures,
and object-lifetime divergence.
