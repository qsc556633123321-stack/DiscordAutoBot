# Community Tracking Adapter Reader Migration Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Adapter-only implementation | Unsafe; current runtime injection would be incompatible. |
| B. Atomic adapter plus runtime reader injection | **Recommended next slice.** |
| C. Dual-mode transitional implementation | Rejected; it introduces duplicate dependency ownership. |
| D. Runtime-only reader construction | Unsafe; adapters retain the old contract. |
| E. `readOnboardingData` cleanup | Deferred until atomic migration removes all injected references. |
| F. `saveOnboarding` cleanup | Deferred; independent zero-consumer cleanup. |

The next production allowlist is exactly the two tracking adapters and
`src/systems/communityConcierge.js`. The reader remains unchanged. Progress
stays 75% because this preparation has not moved runtime ownership.
