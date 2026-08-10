# Community Guide Final Closure Decision

## Decision: CLOSED

Guide is closed as a feature migration boundary. Its read, lookup, mutation,
and persistence responsibilities are all owned by approved boundaries, and
runtime regression coverage preserves identity, force mode, failure semantics,
partial-success behavior, one-read behavior, and the atomic four-field Guide
persistence request.

The remaining `readOnboardingData` consumer belongs to Welcome's separate
tracked-channel query. It is not a Guide runtime dependency and does not block
Guide closure. `saveOnboarding` remains a zero-consumer helper and is not
removed in this closure slice.

## Follow-up Decision

The next recommended slice is **Welcome Channel Tracking Read Boundary
Preparation**. It addresses the final active runtime consumer before any
`readOnboardingData` cleanup work is considered.
