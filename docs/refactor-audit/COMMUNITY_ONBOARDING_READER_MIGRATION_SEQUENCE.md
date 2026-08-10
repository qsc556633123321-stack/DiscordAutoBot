# Community Onboarding Reader Migration Sequence

1. Implement the Infrastructure reader with frozen filesystem compatibility.
2. Prepare and migrate message/channel tracking adapter dependencies.
3. Redirect the three runtime constructions to provide the reader.
4. Re-audit and remove `readOnboardingData`.
5. Delete `saveOnboarding` in its independent cleanup slice.
6. Reassess Concierge filesystem ownership only after both helpers are gone.

Each step requires regression, architecture, legacy, quality, and rollback
review before the next begins.
