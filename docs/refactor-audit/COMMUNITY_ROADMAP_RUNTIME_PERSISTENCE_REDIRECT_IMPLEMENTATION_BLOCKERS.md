# Community Roadmap Runtime Persistence Redirect Implementation Blockers

No blocker prevents the completed narrow redirect.

Remaining boundaries:

1. Guide persistence continues to call legacy `saveOnboarding`.
2. Shared `saveOnboarding` cleanup is not part of the Roadmap redirect.
3. Schema changes, async persistence, and new writer/repository/Port work are
   explicitly excluded.
