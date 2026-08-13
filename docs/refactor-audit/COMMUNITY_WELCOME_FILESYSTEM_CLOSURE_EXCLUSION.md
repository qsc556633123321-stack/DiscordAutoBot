# Community Welcome Filesystem Closure Exclusion

`sendConciergeWelcome` constructs `CommunityOnboardingStateReader`, but it does
not call `fs`, `readJson`, `ensureFile`, `readFile`, or `writeFile` itself. The
reader's `ONBOARDING_FILE` dependency belongs to the shared Community runtime
composition and remains an overall Community filesystem migration concern.

That global ownership does not block Welcome closure: the Welcome flow consumes
the approved reader boundary and has no direct filesystem I/O.
