# Community StateReader Current Contract

Current factory: `createCommunityOnboardingStateReader({ filePath, readJson })`.

- Validation: `readJson` must be a function or it throws `TypeError('CommunityOnboardingStateReader requires readJson')`.
- Public surface: frozen `{ readOnboardingState }`.
- Delegation: `readOnboardingState()` returns `readJson(filePath, {})` exactly; it does not clone, catch, log, retry, cache, parse, or normalize.
- Identity and failure: the returned root and any thrown value preserve exact identity.

This contract remains production-active in this preparation slice.
