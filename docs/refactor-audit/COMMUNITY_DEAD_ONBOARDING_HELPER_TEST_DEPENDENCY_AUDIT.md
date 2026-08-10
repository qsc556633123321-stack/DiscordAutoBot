# Community Dead Onboarding Helper Test Dependency Audit

References are deadness characterizations, historical preparation/source guards,
legacy reference fakes, or fixtures. Behavior regressions for Guide, Roadmap,
Welcome, and persistence do not invoke either production helper.

Strategy: update source-string and deadness guards to the post-cleanup contract.
Do not retain production dead code merely for historical assertions. No test
requires retirement before cleanup implementation.
