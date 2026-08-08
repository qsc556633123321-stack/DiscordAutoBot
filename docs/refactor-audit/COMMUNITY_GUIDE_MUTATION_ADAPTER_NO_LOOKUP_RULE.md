# Guide Mutation Adapter No Lookup Rule

The mutation adapter never calls `lookupTrackedMessage` or `messages.fetch`.
Pre-Plan lookup is caller-owned. With lookup and mutation adapters sharing one
session, the Edit path has exactly one message fetch total.
