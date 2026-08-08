# Guide Adapter Pair Session Model

The future per-invocation sequence is: ensure a channel, create one resource
session for it, create one lookup adapter with that session, then create one
mutation adapter with that same session. This is a model only; no composition
or runtime wiring exists. Sessions must not be shared between invocations.
