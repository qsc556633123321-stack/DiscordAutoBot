# Community Dead Onboarding Helper Identifier Audit

## `readOnboardingData`

| Category | Result |
| --- | --- |
| Production definition | One: `src/systems/communityConcierge.js` |
| Production invocation, injection, alias | Zero |
| Production export, re-export, dynamic access | Zero |
| Tests | Historical fakes, preparation candidates, source guards, and deadness tests only |
| Scripts/tools | Zero executable consumers |
| Docs | Historical migration references only |

## `saveOnboarding`

| Category | Result |
| --- | --- |
| Production definition | One: `src/systems/communityConcierge.js` |
| Production invocation, injection, alias | Zero |
| Production export, re-export, dynamic access | Zero |
| Tests | Historical source-string guards, fixtures, and test fakes only |
| Scripts/tools | Zero executable consumers |
| Docs | Historical migration references only |

Neither identifier has a production consumer. Historical references are not
compatibility consumers and must be updated during deletion.
