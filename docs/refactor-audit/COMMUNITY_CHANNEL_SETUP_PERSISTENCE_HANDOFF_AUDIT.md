# Community Channel Setup Persistence Handoff Audit

Channel setup itself performs no persistence. It returns the exact ensured
channel object to the closed publication flows. After a successful message
edit/send, Guide persists `guildId`, `channelId`, `messageId`, native task
recommendations, and excluded channels; Roadmap persists `guildId`,
`channelId`, and `messageId`.

Thus channel creation failure prevents the handoff. Guide overwrite failure is
swallowed and does not prevent it. Publication or persistence failure occurs
after any created/moved channel and does not roll it back. This slice does not
reopen either publication contract.
