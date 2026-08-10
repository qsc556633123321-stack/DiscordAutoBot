# Community Onboarding Filesystem Ownership Audit

| Resource | Current owner | Notes |
| --- | --- | --- |
| `ONBOARDING_FILE` | `communityConcierge.js` legacy runtime | Still supplied to Guide/Roadmap persistence feature construction. |
| `readJson` / `ensureFile` | `communityConcierge.js` legacy compatibility reader | Creates a missing file and returns `{}` for malformed JSON or read failure. |
| `readOnboardingData` | Legacy helper | Adapters consume it through injection. |
| `saveOnboarding` | Retained legacy delegator | Zero calls; it constructs the generic publication persistence feature. |
| publication filesystem adapter | Infrastructure | Owns generic root read/merge/write behavior independently of `saveOnboarding`. |

Cleanup must not move `ONBOARDING_FILE`, `readJson`, or filesystem imports as a
side effect. A replacement reader needs a separately characterized missing-file
creation and `{}` fallback contract.
