# Guide Resource Session Per-Invocation Adapter Model

Conceptually: ensure channel once, create a session from that channel, create
lookup and mutation adapters over that same session, run orchestration, then
release references after the invocation. This has no global state and preserves
same-resource continuity. It is not composition wiring and has not been added
to runtime.
