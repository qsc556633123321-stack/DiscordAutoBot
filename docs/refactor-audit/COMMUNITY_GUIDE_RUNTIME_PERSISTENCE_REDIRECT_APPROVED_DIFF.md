# Guide Runtime Persistence Redirect: Approved Next Diff

The next implementation slice may modify only
`src/systems/communityConcierge.js` for required imports and final Guide
persistence call. It must not modify the Guide request, Guide reuse feature,
generic persistence, infrastructure, JSON schema, Roadmap runtime, or the
`saveOnboarding` definition. No cleanup is approved in that change.
