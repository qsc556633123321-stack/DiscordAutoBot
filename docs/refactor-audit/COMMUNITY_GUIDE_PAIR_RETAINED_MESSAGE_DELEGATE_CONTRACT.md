# Community Guide Pair Retained Message Delegate Contract

Future candidate output:

```js
{ lookupPort, mutationPort, getRetainedMessage }
```

`getRetainedMessage()` delegates directly to the same Pair's Session. It has no I/O, no retry, no persistence write, no permission mutation, and no error remapping. It returns the exact retained `Message` identity or `null`.
