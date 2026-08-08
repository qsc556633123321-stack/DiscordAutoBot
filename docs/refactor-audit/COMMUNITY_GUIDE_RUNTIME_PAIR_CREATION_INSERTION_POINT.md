# Guide Runtime Pair Creation Insertion Point

The only candidate insertion point is immediately after:

```js
const channel = await getOrCreateGuideChannel(guild);
```

This is before payload construction, tracked ID read, lookup, Plan, edit/send,
persist, and return. The candidate must receive the exact channel object and
must not replace any later legacy operation.
