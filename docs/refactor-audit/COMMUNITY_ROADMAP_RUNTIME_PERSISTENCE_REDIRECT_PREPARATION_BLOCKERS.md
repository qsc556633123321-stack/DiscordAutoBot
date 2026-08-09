# Community Roadmap Runtime Persistence Redirect Preparation Blockers

1. Feature construction lifetime remains a production decision and was not
   selected by preparation tests.
2. Writer-swallowed `persisted: false` must remain ignored by runtime.
3. Generic invariant throw behavior must be preserved without catch or wrap.
4. The persistence call must remain after successful Edit or validated Send.
5. Guide persistence and all shared `saveOnboarding` consumers are excluded.
