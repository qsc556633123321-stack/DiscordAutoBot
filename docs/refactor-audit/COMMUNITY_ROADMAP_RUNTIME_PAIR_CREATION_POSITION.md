# Community Roadmap Runtime Pair Creation Position

The only approved future insertion point is immediately after:

```text
const channel = await getOrCreateRoadmapChannel(guild)
```

The future runtime may then create a Pair with the exact object:

```js
communityRoadmapAdapterPairFeature.createAdapterPair({ ensuredChannel: channel })
```

It must continue with payload construction, state read, the direct legacy
`channel.messages.fetch(...).catch(() => null)`, edit/send, persistence, and
return unchanged. It must not resolve the channel again from cache or by id.
