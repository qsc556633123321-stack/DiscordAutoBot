# Community AI Text Generation Boundary Implementation

## Scope

This slice moves only the Community Concierge OpenAI transport boundary. It
does not change Guide publication, Concierge prompt content, interactions, or
Discord replies.

## Ownership

- Runtime (`communityConcierge.js`): `generateConciergeText(kind, context,
  fallback)`, exact request construction, model, prompt, JSON user input, and
  caller fallback selection.
- Infrastructure (`CommunityConciergeTextGenerationAdapter`): current API-key
  lookup per call, lazy OpenAI load, client construction, request transport,
  response trim, and silent fallback.
- Legacy compatibility: `legacyConciergeTextGenerator` keeps its existing
  export and delegates to the unchanged public Runtime helper.

## Compatibility

The adapter preserves the legacy `if (!apiKey)` predicate, one lazy SDK load,
one client, and one request for each truthy-key invocation. It passes the
Runtime request object unchanged and returns the exact fallback value for no
key, malformed responses, and all transport/parser failures. It does not log,
retry, throw, access Discord, read/write files, or persist state.

## Validation

The implementation suite covers key timing, request/fallback identity,
response normalization, malformed responses, silent failures, per-invocation
client creation, the compatibility caller, and source-boundary guards.

## Next Decision

The next slice should be Deployment Readiness Preparation. Remaining Concierge
runtime concerns are not another clearly isolated direct external-transport
owner, so a new structural migration should not be selected automatically.
