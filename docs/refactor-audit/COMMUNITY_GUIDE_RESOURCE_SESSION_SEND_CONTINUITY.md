# Guide Resource Session Send Continuity

Send must call `ensuredChannel.send(payload)` on the exact channel returned by
the legacy ensure step. It must not call `client.channels.fetch`,
`guild.channels.fetch`, cache lookup, fallback resolution, or ensure again.
Compatible post-ensure channel resolution count is zero.
