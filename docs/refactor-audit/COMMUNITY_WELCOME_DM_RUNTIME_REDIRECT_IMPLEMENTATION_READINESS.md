# Community Welcome DM Runtime Redirect Implementation Readiness

Candidate A, **DM Runtime Redirect Implementation**, is ready. The adapter
already preserves recipient identity, payload identity, raw success identity,
and swallowed failure behavior. The test-only candidate additionally freezes
payload-to-construction-to-send ordering, no-channel zero construction, and
the runtime's `undefined` return.

Candidate B, adapter modification, is rejected: no adapter change is needed.
Candidate C, redirect plus final closure audit, is deferred to keep the runtime
change and closure decision separate. Candidate D, final closure audit, follows
the redirect. Candidate E, role work, is unrelated. Candidate F, retaining the
direct expression, remains the rollback path.

The next production allowlist is only `src/systems/communityConcierge.js` for
the adapter import and replacement of the direct DM send expression.
