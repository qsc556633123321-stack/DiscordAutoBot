# Community Button Dispatch Boundary Implementation Result

Concierge prefix dispatch is now modern-family owned. The active owner is
`communityConciergeButtons`; it delegates to `handleConciergeButton`, whose
return value remains intentionally ignored. Unknown `concierge_` IDs still
match, invoke the handler once, make no reply when it returns `false`, and do
not fall through to legacy fallback.

The modern handler owns the exact legacy-compatible error wrapper: it logs
`Concierge button failed:`, replies only when neither replied nor deferred, and
uses the existing generic ephemeral payload. Exact-ID mapping remains
Application-owned, presentation remains runtime-owned, and role workflow
remains Application/Infrastructure-owned. The global legacy fallback remains
active for non-Concierge unmatched interactions.
