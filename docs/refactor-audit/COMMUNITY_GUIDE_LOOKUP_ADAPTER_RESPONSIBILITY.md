# Guide Lookup Adapter Responsibility

A future adapter must implement the existing Lookup Port shape, receive a pure
request, call the current session once, map its internal outcome, and return a
pure result. It must not resolve a guild/channel, create/ensure a channel or
session, know force or Plan, mutate/send a message, persist, run Roadmap, or
touch interactions.
