# Community Welcome DM Delivery Runtime Forecast

The future runtime redirect is intentionally not part of this slice. Its narrow
replacement is expected to be per invocation, after the existing payload is
built:

```js
const dmDelivery = createCommunityWelcomeDmDeliveryAdapter({ member });
await dmDelivery.send(payload);
```

`sendConciergeWelcome` must continue to return `undefined`; it currently
discards the resolved message and swallows delivery rejection as `null`.
