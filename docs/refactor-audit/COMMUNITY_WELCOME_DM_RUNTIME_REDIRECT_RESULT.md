# Community Welcome DM Runtime Redirect Result

Welcome now constructs `createCommunityWelcomeDmDeliveryAdapter({ member })`
per delivered welcome after the payload is built, then awaits
`dmDelivery.send(payload)`. The direct `member.send` expression is removed from
`sendConciergeWelcome`.

Channel tracking and resolution remain runtime-active through their existing
boundaries. Semantic request mapping and payload construction are unchanged.
The raw Message and `null` adapter results remain discarded, so the runtime
function still returns `undefined`. Welcome is not closed pending its final
closure audit.
