# Community Welcome DM Runtime Construction Decision

The approved future lifetime is **per delivery, per invocation**, after the
existing guide channel is resolved and the payload is built. This preserves the
exact live `member`, avoids adapter construction when no guide channel exists,
and does not introduce module state, composition, or dependency injection.

The redirect may replace only the direct send expression with construction of
`createCommunityWelcomeDmDeliveryAdapter({ member })` followed by
`await dmDelivery.send(payload)`. Tracking, resolution, payload construction,
and the implicit `undefined` return remain in their current order.
