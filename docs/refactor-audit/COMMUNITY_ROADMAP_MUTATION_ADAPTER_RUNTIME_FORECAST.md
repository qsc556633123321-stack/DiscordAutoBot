# Community Roadmap Mutation Adapter Runtime Forecast

Future Edit flow: `mutationPort.edit({ messageId, payload })` returns
`EditSuccess` using the original retained Message ID. Future Send flow returns
`SendSuccess` using the exact sent Message ID. Both operations reject raw
Session failures.

This is a forecast only. The current runtime continues to call
`message.edit(payload)` or `channel.send(payload)` directly, then retains its
legacy persistence ordering.
