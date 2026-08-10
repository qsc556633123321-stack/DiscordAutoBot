# Community Shared Legacy Helper Cleanup Decision

| Candidate | Decision |
| --- | --- |
| A. Delete both helpers directly | Rejected: tracking adapters still require the read compatibility dependency. |
| B. Implement Infrastructure onboarding-state reader first | **Recommended.** It can replace adapter injection while preserving reader semantics. |
| C. Delete `saveOnboarding` only | Ready after a narrow deletion implementation slice and regression review. |
| D. Keep both temporarily | Rejected as the next step; ownership is now fully characterized. |
| E. Move both helpers wholesale | Rejected: would carry legacy runtime ownership into Infrastructure without a contract. |
| F. Other minimal migration | No smaller complete option found. |

Recommended order: prepare and implement the reader boundary, redirect the
three adapter injections, re-audit one-read/failure behavior, then remove
`readOnboardingData`; delete `saveOnboarding` separately or in the same cleanup
implementation only after its deadness guard remains green.
