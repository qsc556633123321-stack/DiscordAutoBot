# Community Button Dispatch Existing Pattern Audit

The modern interaction gateway recognizes button interactions and selects five
family modules: role, game, voice, panel, and admin. Each current family module
is routing-only and directly delegates to `legacyInteractionRuntime.execute()`.
Unmatched buttons use `legacyInteractionDispatcher.execute()`.

There is no reusable Concierge-specific dispatcher, handler registry, custom-ID
matcher, or application dispatch port. Reusing the generic family modules would
not reduce legacy ownership because their `handle()` methods still invoke the
entire legacy runtime. A future Concierge boundary should be narrow and should
not move the generic legacy error wrapper until its behavior is covered.
