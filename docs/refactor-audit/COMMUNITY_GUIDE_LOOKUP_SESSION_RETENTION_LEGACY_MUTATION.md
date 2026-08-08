# Community Guide Lookup Session Retention with Legacy Mutation

The Session can retain the fetched Message, but the legacy runtime still owns `message.edit(payload)`. A lookup redirect may not call `mutationPort.edit`, because that would alter ownership and create a second mutation path. Any future identity handoff must be explicit, per invocation, and must not add duplicate fetches.
