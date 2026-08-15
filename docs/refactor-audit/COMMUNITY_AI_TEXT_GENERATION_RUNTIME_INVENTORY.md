# Community AI Text Generation Runtime Inventory

## Active Runtime Path

`src/systems/communityConcierge.js`
→ `buildGuidePayload(guild)`
→ `createCommunityGuideReadCompatibilityAdapter({ conciergeTextGenerator })`
→ Guide read application query
→ `generateConciergeText(kind, context, fallback)`.

The helper is also exported and is the default implementation behind
`src/adapters/legacy/legacyConciergeTextGenerator.js`, used by the Help Me
Start composition compatibility path.

## Current Helper

`generateConciergeText` reads `process.env.OPENAI_API_KEY` at invocation time.
When it is falsy, it returns the caller-provided fallback without importing the
SDK or constructing a client. With a truthy key, it lazily imports `openai`,
constructs `new OpenAI({ apiKey })`, calls `chat.completions.create`, then
returns `choices[0].message.content.trim() || fallback`. Any exception from
the import, constructor, request, or response parsing returns the same
fallback silently.

## Scope Exclusion

Other OpenAI users, including Voice, layout, game suggestion, and legacy
security helpers, are not consumers of this Concierge helper and are excluded.
