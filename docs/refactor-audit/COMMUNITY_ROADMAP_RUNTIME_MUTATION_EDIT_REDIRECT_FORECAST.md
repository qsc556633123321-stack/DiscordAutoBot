# Community Roadmap Runtime Mutation Edit Redirect Forecast

Future redirect would call `mutationPort.edit({ messageId: message.id, payload })`
and recover the exact retained `M` through `getRetainedMessage()`. It must keep
the local raw Message for persistence and return identity, preserve raw
rejections, and retain current edit-before-persistence ordering.
