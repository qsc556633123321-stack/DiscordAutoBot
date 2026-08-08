# Guide Mutation Plan Branch Runtime Input Audit

`setupCommunityGuide()` reads the legacy tracked ID, conditionally fetches the
message, then creates the existing application input with `guildId`,
`options.mode`, the unnormalised tracked ID, availability, and lookup-attempt
state. It calls `buildGuidePublicationMutationPlan()` once after fetch and
before the legacy `message.edit()` / `channel.send()` calls. The Plan and
OperationType are imported from the application barrel; no Plan source changes
are required.
