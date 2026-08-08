# Guide Mutation Adapter Session Injection

Approved construction is:

```js
createGuidePublicationMessageMutationDiscordAdapter({ session })
```

The session is per invocation. A global registry, singleton, AsyncLocalStorage,
composition singleton, callback lookup, or adapter-created session would change
lifetime and resource-continuity assumptions and is rejected for this boundary.
