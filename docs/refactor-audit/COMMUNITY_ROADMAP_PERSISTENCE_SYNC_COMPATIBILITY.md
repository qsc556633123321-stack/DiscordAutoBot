# Roadmap Persistence Sync Compatibility

`saveOnboarding` currently invokes the composed generic feature synchronously.
Its use case and filesystem adapter are synchronous. Introducing `await` or an
async wrapper could change microtask timing and error/order semantics even if
the stored JSON matched.

Freeze: a future request mapper and reuse adapter must keep the current call
synchronous until a separate async compatibility characterization is approved.
