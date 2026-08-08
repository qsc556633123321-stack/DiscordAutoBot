# Guide Pair Constructor Chain

Composition Feature delegates to Pair Factory, which creates Resource Session,
Lookup Adapter, and Mutation Adapter. Valid channel construction performs no
fetch/edit/send and returns lookup/mutation ports. The only synchronous throw
surface in the chain is malformed ensured-channel/session validation.
