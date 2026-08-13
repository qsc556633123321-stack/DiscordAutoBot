# Community Welcome DM Delivery Adapter Post-Implementation Readiness

The narrow Infrastructure adapter is implemented but is not runtime-used. It
preserves the direct legacy expression exactly: `member.send(payload).catch(() => null)`.

## Decision

Candidate A, **DM Runtime Redirect Preparation**, is the recommended next
slice. It must freeze construction timing, return-value discard behavior, and
the existing no-channel early return before redirecting `sendConciergeWelcome`.

Candidate B, direct redirect implementation, is deferred pending that
preparation. Candidate C, an atomic adapter-plus-runtime migration, is rejected
because the adapter is now independently covered. Candidate D, final closure,
is premature. Candidate E, a generic DM port, is rejected as unnecessary.
Candidate F, retaining the direct runtime expression, remains the rollback path.
