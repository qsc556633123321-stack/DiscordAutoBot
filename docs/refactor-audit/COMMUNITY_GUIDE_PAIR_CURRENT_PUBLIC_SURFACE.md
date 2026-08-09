# Community Guide Pair Current Public Surface

`createGuidePublicationAdapterPair({ ensuredChannel })` accepts the ensured
Discord channel produced by the existing runtime. It creates one new
`GuidePublicationResourceSession`, then creates one lookup adapter and one
mutation adapter against that same Session. It currently returns:

```js
{ lookupPort, mutationPort }
```

Pair creation performs zero Discord I/O: it does not fetch, edit, send, persist,
or apply permissions. The Resource Session owns the retained state and owns
`getRetainedMessage()` privately. The Pair does not expose the session, channel,
message manager, cache, or a generic resource API. This remains the production
contract for this preparation slice.
